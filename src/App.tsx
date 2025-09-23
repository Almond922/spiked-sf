import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Camera, Users, Award, TrendingUp, Shield, Car, Train, Bus, Home, Star, Trophy, Clock, Eye, BarChart3, PieChart, Activity, Zap, Target, Gift, Download, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const TransportDataPlatform = () => {
  const [activeTab, setActiveTab] = useState('live-tracking');
  const [userPoints, setUserPoints] = useState(1250);
  const [userLevel, setUserLevel] = useState(3);
  const [currentLocation, setCurrentLocation] = useState({ lat: 19.0760, lng: 72.8777, type: 'Home' });
  const [connectedUsers] = useState(847);
  const [todayCollections] = useState(23);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Simulated live data
  const [liveUsers, setLiveUsers] = useState([
    { id: 1, name: 'Alex Kumar', location: 'Mumbai Metro', transport: 'metro', points: 890, level: 2, lat: 19.0760, lng: 72.8777, icon: 'metro' },
    { id: 2, name: 'Priya Shah', location: 'BEST Bus', transport: 'bus', points: 1340, level: 4, lat: 19.0896, lng: 72.8656, icon: 'bus' },
    { id: 3, name: 'Rohit Patel', location: 'Local Train', transport: 'train', points: 756, level: 2, lat: 19.0544, lng: 72.8714, icon: 'train' },
    { id: 4, name: 'Maya Singh', location: 'Taxi', transport: 'car', points: 1120, level: 3, lat: 19.1136, lng: 72.8697, icon: 'car' },
    { id: 5, name: 'Arjun Mehta', location: 'Home', transport: 'home', points: 2100, level: 5, lat: 19.0728, lng: 72.8826, icon: 'home' }
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
    switch (type) {
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
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Very High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const downloadReport = () => {
    setPdfGenerating(true);
    setShowPdfModal(true);

    setTimeout(() => {
      setPdfGenerating(false);
      // In a real app, this is where you'd trigger a PDF generation library
      // e.g., html2canvas and jsPDF to capture the current view.
      // For this demo, we'll just show the user a success message.
      alert('Report has been successfully generated and downloaded!');
      setShowPdfModal(false);
    }, 3000); // Simulate a 3-second generation process
  };

  // PDF Generation Modal
  const PdfGenerationModal = () => {
    if (!showPdfModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-all duration-300">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
          <div className="flex justify-end">
            <button onClick={() => setShowPdfModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center">
            <Download className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">{pdfGenerating ? "Generating Report..." : "Report Ready!"}</h3>
            <p className="text-gray-600 mb-6">
              {pdfGenerating
                ? "Please wait while we compile your personalized data report."
                : "Your detailed report is ready for download."}
            </p>
            {pdfGenerating ? (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full animate-pulse-width"></div>
              </div>
            ) : (
              <button
                onClick={() => {
                  alert("Download started!");
                  setShowPdfModal(false);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Download Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shimmer">
                <MapPin className="h-8 w-8 text-white animate-float" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Transport<span className="font-extrabold">Tracker</span> Pro
                </h1>
                <p className="text-sm text-gray-600">Real-time Transport Data Collection Platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden sm:block text-center">
                <div className="text-2xl font-bold text-blue-600">{connectedUsers}</div>
                <div className="text-xs text-gray-500">Active Users</div>
              </div>
              <div className="hidden sm:block text-center">
                <div className="text-2xl font-bold text-purple-600">{todayCollections}</div>
                <div className="text-xs text-gray-500">Data Points Today</div>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl">
                <Trophy className="h-5 w-5 text-yellow-500 animate-pulse" />
                <div>
                  <div className="font-semibold text-gray-800">{userPoints} Pts</div>
                  <div className="text-xs text-gray-600">Level {userLevel}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6 relative">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-28">
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 btn-press ${
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

            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl card-hover">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{liveUsers.length}</div>
                    <div className="text-xs text-blue-500">Online Now</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl card-hover">
                <div className="flex items-center justify-between">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">94%</div>
                    <div className="text-xs text-purple-500">Data Accuracy</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl card-hover">
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
              <div className="space-y-6 slide-in-right">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Live User Tracking</h2>
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Updates</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.gstatic.com/earth/social/00_general_share.png')] bg-cover opacity-20"></div>
                    <div className="relative text-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Mumbai Transport Network</h3>
                      <p className="text-sm text-gray-600">Real-time user locations and transport modes</p>
                    </div>
                    <div className="relative h-96 rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.865955620953!2d72.87148567503738!3d19.02701198215984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf16f06a19f9%3A0xc3f1464455f65313!2sCSMT%20Station!5e0!3m2!1sen!2sin!4v1695420468087!5m2!1sen!2sin"
                        title="Mumbai Transport Network"
                      ></iframe>
                    </div>

                    <div className="absolute top-8 left-8 flex flex-col space-y-4">
                      {liveUsers.map((user, index) => (
                        <div key={user.id} className="bg-white p-3 rounded-xl shadow-lg flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${user.icon === 'metro' ? 'bg-blue-200' : user.icon === 'bus' ? 'bg-green-200' : user.icon === 'train' ? 'bg-purple-200' : 'bg-orange-200'}`}>
                            {getTransportIcon(user.transport)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-600">{user.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Collection Tab */}
            {activeTab === 'data-collection' && (
              <div className="space-y-6 slide-in-right">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Data Collection Records</h2>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all btn-press">
                      <Camera className="h-4 w-4 inline mr-2" />
                      New Collection
                    </button>
                  </div>

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
                      <button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors btn-press">
                        Submit Data
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Collections</h3>
                    {dataCollections.map(collection => (
                      <div key={collection.id} className="bg-gray-50 rounded-xl p-4 card-hover">
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
                            <div className="text-blue-600 font-semibold data-pulse">+{collection.points}</div>
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
              <div className="space-y-6 slide-in-right">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Collections</p>
                        <p className="text-2xl font-bold text-blue-600">12,847</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-green-600">847</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                        <p className="text-2xl font-bold text-purple-600">2.3s</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Data Accuracy</p>
                        <p className="text-2xl font-bold text-orange-600">94.7%</p>
                      </div>
                      <Target className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>

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
                        <Legend />
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
                <div className="bg-white rounded-2xl shadow-lg p-6 flex justify-center items-center">
                  <button onClick={downloadReport} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all btn-press">
                    <Download className="inline mr-2" /> Download Analytics Report (PDF)
                  </button>
                </div>
              </div>
            )}

            {/* Gamification Tab */}
            {activeTab === 'gamification' && (
              <div className="space-y-6 slide-in-right">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Rewards & Achievements</h2>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 card-hover">
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
                        className="progress-gradient h-3 rounded-full"
                        style={{ width: `${(userPoints % 500) / 5}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">{500 - (userPoints % 500)} points to next level</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Achievements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 text-center card-hover">
                        <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2 animate-bounce-in" />
                        <h4 className="font-semibold text-gray-800">Data Champion</h4>
                        <p className="text-sm text-gray-600">100+ collections</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 text-center card-hover">
                        <Camera className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-bounce-in" />
                        <h4 className="font-semibold text-gray-800">Photo Master</h4>
                        <p className="text-sm text-gray-600">50+ photos uploaded</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 text-center card-hover">
                        <Star className="h-8 w-8 text-green-600 mx-auto mb-2 animate-bounce-in" />
                        <h4 className="font-semibold text-gray-800">Early Bird</h4>
                        <p className="text-sm text-gray-600">Morning collections</p>
                      </div>
                    </div>
                  </div>

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
                        <div key={user.rank} className={`flex items-center justify-between p-3 rounded-lg btn-press ${user.name === 'You' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white hover:bg-gray-100'}`}>
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{user.badge}</span>
                            <span className="font-medium text-gray-800">{user.name}</span>
                          </div>
                          <div className="font-bold text-blue-600">{user.points} pts</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Challenges</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg card-hover">
                        <div className="flex items-center space-x-3">
                          <Target className="h-6 w-6 text-green-600" />
                          <div>
                            <h4 className="font-semibold text-gray-800">Morning Rush Data</h4>
                            <p className="text-sm text-gray-600">Collect 3 data points between 7-9 AM</p>
                          </div>
                        </div>
                        <div className="text-green-600 font-bold">+100 pts</div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg card-hover">
                        <div className="flex items-center space-x-3">
                          <Camera className="h-6 w-6 text-purple-600" />
                          <div>
                            <h4 className="font-semibold text-gray-800">Photo Challenge</h4>
                            <p className="text-sm text-gray-600">Upload 5 transport photos today</p>
                          </div>
                        </div>
                        <div className="text-purple-600 font-bold">+150 pts</div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg card-hover">
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500 max-w-sm glass slide-in-right">
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

      <div className="fixed top-20 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-2 animate-pulse">
        <div className="h-2 w-2 bg-white rounded-full"></div>
        <span>Live Data</span>
      </div>

      {PdfGenerationModal()}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        .shimmer::after {
          animation: shimmer 2s infinite;
        }

        .btn-press:active { transform: scale(0.98); }
        
        @keyframes pulse-width {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }

        .animate-pulse-width {
          animation: pulse-width 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }

        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .slide-in-right {
          animation: slideInRight 0.5s ease-out;
        }
        
        @keyframes slideInRight {
          0% { transform: translateX(20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes progressShine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .progress-gradient {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
          background-size: 200% 100%;
          animation: progressShine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TransportDataPlatform;