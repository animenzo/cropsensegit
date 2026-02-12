import React from 'react';
import { useQuery } from '@tanstack/react-query';

import BlynkConfig from '../components/dashboard/BlynkConfig';
import { FaUserCircle, FaEnvelope, FaIdBadge, FaEdit } from 'react-icons/fa';
import PinManager from '../components/dashboard/PinManager';
import API from '../services/api';

const UserProfile = () => {
  // 1. Fetch User Data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => (await API.get('/auth/profile')).data
  });

  // 2. Fetch Farms (to get farmId for PinManager)
  // In a real app, you might let user select which farm to configure
  const { data: farms, isLoading: farmsLoading } = useQuery({
    queryKey: ['farms'],
    queryFn: () => API.getFarms()
  });

  // Select the first farm by default
  const defaultFarmId = farms && farms.length > 0 ? farms[0]._id : null;

  if (userLoading || farmsLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-800">System Configuration</h1>
          <p className="text-gray-500">Manage user profile, IoT connection, and sensor mapping.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: User Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
               <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-gray-400">
                  <FaUserCircle />
               </div>
               <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
               <p className="text-sm text-gray-500 mb-6">{user?.email}</p>
               
               <div className="pt-6 border-t border-gray-100 text-left space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                     <FaEnvelope className="text-emerald-500" />
                     <span className="text-sm truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                     <FaIdBadge className="text-emerald-500" />
                     <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded truncate">
                        ID: {user?._id}
                     </span>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Configuration */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Blynk Auth Token Config */}
            <BlynkConfig 
                isConfigured={user?.blynk?.isConfigured} 
                existingToken={user?.blynk?.authToken} 
            />

            {/* 2. Pin Manager (Only show if we have a farm) */}
            {defaultFarmId ? (
              <PinManager farmId={defaultFarmId} />
            ) : (
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 text-amber-800">
                You need to create a <strong>Farm</strong> first before configuring sensors.
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;