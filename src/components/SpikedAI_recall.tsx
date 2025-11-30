const [dealTasks, setDealTasks] = useState<Record<string, any[]>>({}); // Map deal_id -> tasks
const [loadingDealTasks, setLoadingDealTasks] = useState<Set<string>>(new Set());