import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Camera, Users, Award, TrendingUp, Shield, Car, Train, Bus, Home, Star, Trophy, Clock, Eye, BarChart3, PieChart, Activity, Zap, Target, Gift } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';

const TransportDataPlatform = () => {
  const [activeTab, setActiveTab] = useState('live-tracking');
  const [userPoints, setUserPoints] = useState(1250);
  const [userLevel, setUserLevel] = useState(3);
  const [currentLocation, setCurrentLocation] = useState({ lat: 19.0760, lng: 72.8777, type: 'Home' });
  const [connectedUsers] = useState(847);
  const [todayCollections] = useState(23);
  
  // Simulated live data
  const [liveUsers, setLiveUsers] = useState([
    { id: 1, name: 'Alex Kumar', location: 'Mumbai Metro', transport: 'metro', points: 890, level: 2, lat: 19.0760, lng: 72.8777 },
    { id: 2, name: 'Priya Shah', location: 'BEST Bus', transport: 'bus', points: 1340, level: 4, lat: 19.0896, lng: 72.8656 },
    { id: 3, name: 'Rohit Patel', location: 'Local Train', transport: 'train', points: 756, level: 2, lat: 19.0544, lng: 72.8714 },
    { id: 4, name: 'Maya Singh', location: 'Taxi', transport: 'car', points: 1120, level: 3, lat: 19.1136, lng: 72.8697 },
    { id: 5, name: 'Arjun Mehta', location: 'Home', transport: 'home', points: 2100, level: 5, lat: 19.0728, lng: 72.8826 }
  ]);

  const [dataCollections] = useState([
    { id: 1, user: 'Alex Kumar', transport: 'Metro', crowdLevel: 'High', photo: true, time: '09:15 AM', points: 50 },
    { id: 2, user: 'Priya Shah', transport: 'Bus', crowdLevel: 'Medium', photo: true, time: '09:45 AM', points: 40 },
    { id: 3, user: 'Rohit Patel', transport: 'Train', crowdLevel: 'Very High', photo: true, time: '10:20 AM', points: 60 },
    { id: 4, user: 'Maya Singh', transport: 'Car', crowdLevel: 'Low', photo: false, time: '11:00 AM', points: 30 }
  ]);

  const [analyticsData] = useState({
    hourly: [
      { time: '6AM', metro: 120, bus: 80, train: 200, car: 40 },
      { time: '7AM', metro: 180, bus: 120, train: 350, car: 60 },
      { time: '8AM', metro: 250, bus: 200, train: 450, car: 100 },
      { time: '9AM', metro: 300, bus: 280, train: 500, car: 140 },
      { time: '10AM', metro: 220, bus: 160, train: 380, car: 120 },
      { time: '11AM', metro: 180, bus: 140, train: 280, car: 90 }
    ],
    crowdDistribution: [
      { name: 'Low', value: 25, color: '#10B981' },
      { name: 'Medium', value: 35, color: '#F59E0B' },
      { name: 'High', value: 30, color: '#EF4444' },
      { name: 'Very High', value: 10, color: '#7C2D12' }
    ],
    transportMode: [
      { mode: 'Train', users: 450, percentage: 45 },
      { mode: 'Bus', users: 280, percentage: 28 },
      { mode: 'Metro', users: 180, percentage: 18 },
      { mode: 'Car', users: 90, percentage: 9 }
    ]
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev.map(user => ({
        ...user,
        lat: user.lat + (Math.random() - 0.5) * 0.001,
        lng: user.lng + (Math.random() - 0.5) * 0.001,
        points: user.points + Math.floor(Math.random() * 5)
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getTransportIcon = (type) => {
    switch(type) {
      case 'metro': return <Train className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'train': return <Train className="h-4 w-4" />;
      case 'car': return <Car className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  const getLevelBadge = (level) => {
    const colors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-purple-100 text-purple-800',
      5: 'bg-yellow-100 text-yellow-800'
    };
    return colors[level] || colors[1];
  };

  const getCrowdColor = (level) => {
    switch(level) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Very High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TransportTracker Pro
                </h1>
                <p className="text-sm text-gray-600">Real-time Transport Data Collection Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{connectedUsers}</div>
                <div className="text-xs text-gray-500">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{todayCollections}</div>
                <div className="text-xs text-gray-500">Data Points Today</div>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-semibold text-gray-800">{userPoints} Points</div>
                  <div className="text-xs text-gray-600">Level {userLevel}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-2xl shadow-lg p-6 h-fit">
            <nav className="space-y-2">
              {[
                { id: 'live-tracking', label: 'Live Tracking', icon: MapPin },
                { id: 'data-collection', label: 'Data Collection', icon: Camera },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'gamification', label: 'Rewards', icon: Award }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{liveUsers.length}</div>
                    <div className="text-xs text-blue-500">Online Now</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">94%</div>
                    <div className="text-xs text-purple-500">Data Accuracy</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-xs text-green-500">Privacy Safe</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Live Tracking Tab */}
            {activeTab === 'live-tracking' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Live User Tracking</h2>
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Updates</span>
                    </div>
                  </div>

                  {/* Map Simulation */}
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-8 mb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Mumbai Transport Network</h3>
                      <p className="text-sm text-gray-600">Real-time user locations and transport modes</p>
                    </div>
                    <div className="relative h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg overflow-hidden">
                      {liveUsers.map((user, index) => (
                        <div
                          key={user.id}
                          className="absolute animate-pulse"
                          style={{
                            left: `${20 + (index * 15)}%`,
                            top: `${30 + (index * 10)}%`,
                          }}
                        >
                          <div className="bg-white rounded-full p-2 shadow-lg">
                            {getTransportIcon(user.transport)}
                          </div>
                        </div>
                      ))}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                          <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">Interactive Map View</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User List */}
                  <div className="grid gap-4">
                    {liveUsers.map(user => (
                      <div key={user.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-white p-2 rounded-full">
                              {getTransportIcon(user.transport)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{user.name}</h3>
                              <p className="text-sm text-gray-600">{user.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{user.points}</div>
                              <div className="text-xs text-gray-500">Points</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadge(user.level)}`}>
                              Level {user.level}
                            </div>
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Data Collection Tab */}
            {activeTab === 'data-collection' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Data Collection Records</h2>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all">
                      <Camera className="h-4 w-4 inline mr-2" />
                      New Collection
                    </button>
                  </div>

                  {/* Collection Form */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Data Entry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select Transport</option>
                        <option>Metro</option>
                        <option>Bus</option>
                        <option>Train</option>
                        <option>Car</option>
                      </select>
                      <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Crowd Level</option>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Very High</option>
                      </select>
                      <button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors">
                        Submit Data
                      </button>
                    </div>
                  </div>

                  {/* Recent Collections */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Collections</h3>
                    {dataCollections.map(collection => (
                      <div key={collection.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-white p-2 rounded-full">
                              {collection.transport === 'Metro' && <Train className="h-4 w-4" />}
                              {collection.transport === 'Bus' && <Bus className="h-4 w-4" />}
                              {collection.transport === 'Train' && <Train className="h-4 w-4" />}
                              {collection.transport === 'Car' && <Car className="h-4 w-4" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{collection.user}</h4>
                              <p className="text-sm text-gray-600">{collection.transport} • {collection.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCrowdColor(collection.crowdLevel)}`}>
                              {collection.crowdLevel}
                            </span>
                            {collection.photo && (
                              <div className="flex items-center text-green-600">
                                <Camera className="h-4 w-4 mr-1" />
                                <span className="text-xs">Photo</span>
                              </div>
                            )}
                            <div className="text-blue-600 font-semibold">+{collection.points}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Collections</p>
                        <p className="text-2xl font-bold text-blue-600">12,847</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-green-600">847</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                        <p className="text-2xl font-bold text-purple-600">2.3s</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Data Accuracy</p>
                        <p className="text-2xl font-bold text-orange-600">94.7%</p>
                      </div>
                      <Target className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Hourly Transport Usage</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.hourly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="metro" stroke="#3B82F6" strokeWidth={2} />
                        <Line type="monotone" dataKey="bus" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="train" stroke="#8B5CF6" strokeWidth={2} />
                        <Line type="monotone" dataKey="car" stroke="#F59E0B" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Crowd Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          dataKey="value"
                          data={analyticsData.crowdDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {analyticsData.crowdDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Transport Mode Usage</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.transportMode}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mode" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Gamification Tab */}
            {activeTab === 'gamification' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Rewards & Achievements</h2>
                  
                  {/* User Progress */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Your Progress</h3>
                        <p className="text-gray-600">Level {userLevel} Data Collector</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {userPoints}
                        </div>
                        <div className="text-sm text-gray-600">Total Points</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
                        style={{ width: `${(userPoints % 500) / 5}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">{500 - (userPoints % 500)} points to next level</p>
                  </div>

                  {/* Achievement Badges */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Achievements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                        <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-800">Data Champion</h4>
                        <p className="text-sm text-gray-600">100+ collections</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                        <Camera className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-800">Photo Master</h4>
                        <p className="text-sm text-gray-600">50+ photos uploaded</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 text-center">
                        <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-800">Early Bird</h4>
                        <p className="text-sm text-gray-600">Morning collections</p>
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Contributors</h3>
                    <div className="space-y-3">
                      {[
                        { rank: 1, name: 'Maya Singh', points: 2100, badge: '🥇' },
                        { rank: 2, name: 'Priya Shah', points: 1340, badge: '🥈' },
                        { rank: 3, name: 'You', points: 1250, badge: '🥉' },
                        { rank: 4, name: 'Maya Singh', points: 1120, badge: '4️⃣' },
                        { rank: 5, name: 'Alex Kumar', points: 890, badge: '5️⃣' }
                      ].map(user => (
                        <div key={user.rank} className={`flex items-center justify-between p-3 rounded-lg ${user.name === 'You' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white'}`}>
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{user.badge}</span>
                            <span className="font-medium text-gray-800">{user.name}</span>
                          </div>
                          <div className="font-bold text-blue-600">{user.points} pts</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Daily Challenges */}
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Challenges</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Target className="h-6 w-6 text-green-600" />
                          <div>
                            <h4 className="font-semibold text-gray-800">Morning Rush Data</h4>
                            <p className="text-sm text-gray-600">Collect 3 data points between 7-9 AM</p>
                          </div>
                        </div>
                        <div className="text-green-600 font-bold">+100 pts</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Camera className="h-6 w-6 text-purple-600" />
                          <div>
                            <h4 className="font-semibold text-gray-800">Photo Challenge</h4>
                            <p className="text-sm text-gray-600">Upload 5 transport photos today</p>
                          </div>
                        </div>
                        <div className="text-purple-600 font-bold">+150 pts</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Zap className="h-6 w-6 text-blue-600" />
                          <div>
                            <h4 className="font-semibold text-gray-800">Speed Collector</h4>
                            <p className="text-sm text-gray-600">Submit data within 30 seconds</p>
                          </div>
                        </div>
                        <div className="text-blue-600 font-bold">+75 pts</div>
                      </div>
                    </div>
                  </div>

                  {/* Rewards Store */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Rewards Store</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                        <Gift className="h-8 w-8 text-pink-600 mb-2" />
                        <h4 className="font-semibold text-gray-800">Metro Pass</h4>
                        <p className="text-sm text-gray-600 mb-2">1-day unlimited metro rides</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">500 pts</span>
                          <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700">
                            Redeem
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                        <Gift className="h-8 w-8 text-green-600 mb-2" />
                        <h4 className="font-semibold text-gray-800">Bus Voucher</h4>
                        <p className="text-sm text-gray-600 mb-2">₹100 BEST bus credit</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">300 pts</span>
                          <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700">
                            Redeem
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500 max-w-sm">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-800 text-sm">Privacy Protected</h4>
            <p className="text-xs text-gray-600">
              All data is encrypted and anonymized. Location data is processed locally and never stored permanently.
            </p>
          </div>
        </div>
      </div>

      {/* Live Data Indicator */}
      <div className="fixed top-20 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-2">
        <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
        <span>Live Data</span>
      </div>

      {/* Notification Toast */}
      <div className="fixed top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl shadow-lg transform translate-x-full animate-pulse">
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4" />
          <span className="text-sm font-medium">New achievement unlocked!</span>
        </div>
      </div>

      {/* Custom Styles for Enhanced Visual Appeal */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
        }
        
        /* Enhanced hover effects */
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        /* Gradient text animation */
        .gradient-text {
          background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #ec4899, #10b981);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Loading shimmer effect */
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.2) 20%,
            rgba(255, 255, 255, 0.5) 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 2s infinite;
          content: '';
        }
        
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        
        /* Button press animation */
        .btn-press {
          transition: all 0.1s ease-in-out;
        }
        
        .btn-press:active {
          transform: scale(0.98);
        }
        
        /* Pulsing data points */
        .data-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
        
        /* Background patterns */
        .pattern-dots {
          background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .pattern-grid {
          background-image: linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        /* Glass morphism effect */
        .glass {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(209, 213, 219, 0.3);
        }
        
        /* Neon glow effects */
        .neon-blue {
          box-shadow: 0 0 5px #3b82f6, 0 0 10px #3b82f6, 0 0 15px #3b82f6, 0 0 20px #3b82f6;
        }
        
        .neon-purple {
          box-shadow: 0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 15px #8b5cf6, 0 0 20px #8b5cf6;
        }
        
        /* Advanced animations */
        .bounce-in {
          animation: bounceIn 0.6s ease-out;
        }
        
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .slide-in-right {
          animation: slideInRight 0.5s ease-out;
        }
        
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Interactive elements */
        .interactive-card {
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }
        
        .interactive-card:hover {
          transform: rotateY(180deg);
        }
        
        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
        }
        
        .card-back {
          transform: rotateY(180deg);
        }
        
        /* Status indicators */
        .status-online {
          position: relative;
        }
        
        .status-online::before {
          content: '';
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          animation: statusPulse 2s infinite;
        }
        
        @keyframes statusPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        
        /* Progress bars with gradient */
        .progress-gradient {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
          background-size: 200% 100%;
          animation: progressShine 3s ease-in-out infinite;
        }
        
        @keyframes progressShine {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        /* Tooltip styles */
        .tooltip {
          position: relative;
        }
        
        .tooltip::before {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        
        .tooltip:hover::before {
          opacity: 1;
        }
        
        /* Responsive design improvements */
        @media (max-width: 768px) {
          .mobile-stack {
            flex-direction: column;
          }
          
          .mobile-full {
            width: 100%;
          }
          
          .mobile-text-sm {
            font-size: 0.875rem;
          }
        }
        
        /* Dark mode support */
        .dark-mode {
          background: linear-gradient(135deg, #1f2937, #111827);
          color: #f9fafb;
        }
        
        .dark-mode .bg-white {
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(75, 85, 99, 0.3);
        }
        
        .dark-mode .text-gray-800 {
          color: #f9fafb;
        }
        
        .dark-mode .text-gray-600 {
          color: #d1d5db;
        }
        
        /* Enhanced accessibility */
        .focus-ring {
          focus: outline-none;
          focus-visible: ring-2;
          focus-visible: ring-blue-500;
          focus-visible: ring-offset-2;
        }
        
        /* Print styles */
        @media print {
          .no-print {
            display: none;
          }
          
          body {
            background: white !important;
          }
          
          .print-friendly {
            box-shadow: none !important;
            background: white !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TransportDataPlatform;