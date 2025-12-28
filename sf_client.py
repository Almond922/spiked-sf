import httpx
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from dotenv import load_dotenv

load_dotenv()

SF_CLIENT_ID = os.getenv("SF_CLIENT_ID")
SF_CLIENT_SECRET = os.getenv("SF_CLIENT_SECRET")
SF_CALLBACK = os.getenv("SF_CALLBACK")
SF_LOGIN_URL = os.getenv("SF_LOGIN_URL")

class SalesforceClient:
    def __init__(self, access_token: str, instance_url: str):
        self.access_token = access_token
        self.base_url = f"{instance_url}/services/data/v59.0"

    def _headers(self):
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

    # --------------------------------------------------
    # USERS (OWNERS)
    # --------------------------------------------------
    async def get_all_users(self) -> Dict[str, str]:
        query = """
        SELECT Id, Name
        FROM User
        WHERE IsActive = true
        """

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{self.base_url}/query",
                headers=self._headers(),
                params={"q": query}
            )

            if resp.status_code != 200:
                return {}

            return {u["Id"]: u["Name"] for u in resp.json().get("records", [])}

    # --------------------------------------------------
    # UPDATE TASK DESCRIPTION (OVERRIDE LOGIC)
    # --------------------------------------------------
    async def update_task_description(self, task_id: str, new_description: str) -> Dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            get_resp = await client.get(
                f"{self.base_url}/sobjects/Task/{task_id}",
                headers=self._headers()
            )

            current_body = get_resp.json().get("Description", "") if get_resp.status_code == 200 else ""

            marker = "\n\n---\n✨ SpikedAI Latest Update\n"

            if marker in current_body:
                clean_body = current_body.split(marker)[0]
                updated_body = f"{clean_body}{marker}{new_description}"
            else:
                updated_body = f"{current_body}{marker}{new_description}"

            patch_resp = await client.patch(
                f"{self.base_url}/sobjects/Task/{task_id}",
                headers=self._headers(),
                json={"Description": updated_body}
            )

            patch_resp.raise_for_status()
            return patch_resp.json()

    # --------------------------------------------------
    # GET TASKS FOR OPPORTUNITY
    # --------------------------------------------------
    async def get_tasks_for_opportunity(self, opportunity_id: str) -> List[Dict]:
        users = await self.get_all_users()

        query = f"""
        SELECT Id, Subject, Description, Status, Priority, ActivityDate, OwnerId
        FROM Task
        WHERE WhatId = '{opportunity_id}'
        AND Status != 'Completed'
        """

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{self.base_url}/query",
                headers=self._headers(),
                params={"q": query}
            )

            if resp.status_code != 200:
                return []

            tasks = []
            for t in resp.json().get("records", []):
                tasks.append({
                    "task_id": t["Id"],
                    "title": t.get("Subject"),
                    "description": t.get("Description"),
                    "status": t.get("Status"),
                    "priority": t.get("Priority"),
                    "due_date": t.get("ActivityDate"),
                    "assignee_id": t.get("OwnerId"),
                    "assignee_name": users.get(t.get("OwnerId"), "Unassigned"),
                    "opportunity_id": opportunity_id
                })

            return tasks

    # --------------------------------------------------
    # CREATE TASK
    # --------------------------------------------------
    async def create_task_for_opportunity(
        self,
        opportunity_id: str,
        title: str,
        description: str = "",
        priority: str = "Normal",
        due_date: Optional[str] = None,
        owner_id: Optional[str] = None
    ) -> Dict:

        if not due_date:
            due_date = (datetime.utcnow() + timedelta(days=7)).date().isoformat()

        payload = {
            "Subject": title,
            "Description": description,
            "Status": "Not Started",
            "Priority": priority.capitalize(),
            "ActivityDate": due_date,
            "WhatId": opportunity_id
        }

        if owner_id:
            payload["OwnerId"] = owner_id

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self.base_url}/sobjects/Task",
                headers=self._headers(),
                json=payload
            )

            resp.raise_for_status()
            return {"task_id": resp.json()["id"], "status": "success"}

    # --------------------------------------------------
    # OAUTH
    # --------------------------------------------------
    @staticmethod
    async def exchange_code_for_token(code: str) -> Dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{SF_LOGIN_URL}/services/oauth2/token",
                data={
                    "grant_type": "authorization_code",
                    "client_id": SF_CLIENT_ID,
                    "client_secret": SF_CLIENT_SECRET,
                    "redirect_uri": SF_CALLBACK,
                    "code": code
                }
            )
            resp.raise_for_status()
            return resp.json()

    @staticmethod
    async def refresh_access_token(refresh_token: str) -> Dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{SF_LOGIN_URL}/services/oauth2/token",
                data={
                    "grant_type": "refresh_token",
                    "client_id": SF_CLIENT_ID,
                    "client_secret": SF_CLIENT_SECRET,
                    "refresh_token": refresh_token
                }
            )
            resp.raise_for_status()
            return resp.json()
