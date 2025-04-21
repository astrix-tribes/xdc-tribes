import React, { useState } from 'react';
import { usePosts } from '../context/PostsContext';
import { JoinType } from '../utils/contracts/tribeController';

const CreateTribeForm: React.FC = () => {
  const { createNewTribe, refreshTribes } = usePosts();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [joinType, setJoinType] = useState<JoinType>(JoinType.Open);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description) {
      setError('Name and description are required');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await createNewTribe(name, description, joinType);
      
      // Clear form after successful submission
      setName('');
      setDescription('');
      setJoinType(JoinType.Open);
      
      // Refresh tribes list to show the new tribe
      await refreshTribes();
    } catch (err) {
      console.error('Error creating tribe:', err);
      setError('Failed to create tribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#252729] rounded-xl p-5 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-100">Create New Tribe</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-gray-300 mb-2">Tribe Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter tribe name"
            className="w-full p-3 bg-[#252729] border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
            required
            disabled={isSubmitting}
          />
        </div>
        
        {/* Description Input */}
        <div>
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your tribe..."
            rows={4}
            className="w-full p-3 bg-[#252729] border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
            required
            disabled={isSubmitting}
          />
        </div>
        
        {/* Join Type Selection */}
        <div>
          <label className="block text-gray-300 mb-2">Join Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setJoinType(JoinType.Open)}
              className={`p-3 rounded-lg border ${
                joinType === JoinType.Open
                  ? 'bg-[#244B81] border-gray-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
              disabled={isSubmitting}
            >
              <div className="font-medium">Open</div>
              <div className="text-sm opacity-75 mt-1">Anyone can join</div>
            </button>
            
            <button
              type="button"
              onClick={() => setJoinType(JoinType.Approval)}
              className={`p-3 rounded-lg border ${
                joinType === JoinType.Approval
                  ? 'bg-[#244B81] border-gray-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
              disabled={isSubmitting}
            >
              <div className="font-medium">Approval</div>
              <div className="text-sm opacity-75 mt-1">Admin must approve</div>
            </button>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#244B81] text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Tribe...
              </>
            ) : (
              'Create Tribe'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTribeForm; 