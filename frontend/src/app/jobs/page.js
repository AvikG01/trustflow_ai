'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import JobCard from '@/components/jobs/JobCard';
import AIProcessingIndicator from '@/components/ui/AIProcessingIndicator';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiRequest } from '@/lib/api';
import { FiSearch, FiMapPin, FiBriefcase, FiSliders, FiAlertCircle, FiInfo } from 'react-icons/fi';

export default function JobSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('0-2 years');
  const [workMode, setWorkMode] = useState('remote');
  const [jobs, setJobs] = useState([]);
  const [searchStatus, setSearchStatus] = useState('IDLE'); // 'IDLE' | 'SEARCHING' | 'CONNECTING' | 'PROCESSING' | 'SUCCESS' | 'EMPTY' | 'ERROR'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query && !location) {
      setErrorMessage('Please enter a job title, keyword, or location to search.');
      setSearchStatus('ERROR');
      return;
    }

    setErrorMessage('');
    setSearchStatus('SEARCHING');

    // Stepped indicator timeline
    const t1 = setTimeout(() => setSearchStatus('CONNECTING'), 600);
    const t2 = setTimeout(() => setSearchStatus('PROCESSING'), 1400);

    try {
      const res = await apiRequest({
        action: 'searchJobs',
        data: {
          query,
          location,
          experience,
          workMode,
        },
      });

      clearTimeout(t1);
      clearTimeout(t2);

      const returnedJobs = res?.matches || res?.jobs || (Array.isArray(res) ? res : []);
      setJobs(returnedJobs);

      if (returnedJobs.length > 0) {
        setSearchStatus('SUCCESS');
      } else {
        setSearchStatus('EMPTY');
      }
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      console.error('Job search error:', err);
      setErrorMessage(err.message || 'Job search is temporarily unavailable. Please try again.');
      setSearchStatus('ERROR');
    }
  };

  const handleOptimizeForJob = (job) => {
    router.push(`/optimize?jobId=${job.id || ''}&title=${encodeURIComponent(job.title || '')}`);
  };

  const getStepMessage = () => {
    switch (searchStatus) {
      case 'SEARCHING':
        return 'TrustFlow AI is searching available job sources...';
      case 'CONNECTING':
        return 'Connecting to job sources...';
      case 'PROCESSING':
        return 'Matching jobs against your resume...';
      default:
        return 'Searching for open positions...';
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Job Search & Match Engine</h1>
          <p className="text-xs text-slate-400">
            Search authorized job opportunities and evaluate your resume compatibility in real-time.
          </p>
        </div>

        {/* Search Filter Form */}
        <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <FiBriefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Role / Keywords</span>
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                placeholder="e.g. React Developer, Fullstack Engineer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <FiMapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Location / City</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                placeholder="e.g. Bangalore, Remote, Kolkata"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <FiSliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Experience Level</span>
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="0-2 years">0 - 2 Years (Junior / Entry)</option>
                <option value="2-5 years">2 - 5 Years (Mid-level)</option>
                <option value="5+ years">5+ Years (Senior)</option>
                <option value="all">All Experience Levels</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <FiSliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Work Mode</span>
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-Site</option>
                <option value="all">All Modes</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-slate-400 font-mono">
              Direct real-time backend API dispatch
            </span>
            <button
              type="submit"
              disabled={['SEARCHING', 'CONNECTING', 'PROCESSING'].includes(searchStatus)}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
            >
              <FiSearch className="w-4 h-4" />
              <span>
                {['SEARCHING', 'CONNECTING', 'PROCESSING'].includes(searchStatus)
                  ? 'Searching Job Sources...'
                  : 'Search Jobs'}
              </span>
            </button>
          </div>
        </form>

        {/* Stepped Search Loading Indicator */}
        {['SEARCHING', 'CONNECTING', 'PROCESSING'].includes(searchStatus) && (
          <AIProcessingIndicator
            currentState="ANALYZING"
            message={getStepMessage()}
          />
        )}

        {/* IDLE State */}
        {searchStatus === 'IDLE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <FiInfo className="w-10 h-10 text-cyan-400 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-white">Search for your next opportunity</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Enter target job role keywords or preferred location above to perform a live job search against available backend sources.
            </p>
          </div>
        )}

        {/* EMPTY State */}
        {searchStatus === 'EMPTY' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <FiInfo className="w-10 h-10 text-amber-400 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-white">No matching jobs found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No matching job openings were returned by the backend for your search criteria. Try broadening your keywords or location.
            </p>
          </div>
        )}

        {/* ERROR State */}
        {searchStatus === 'ERROR' && (
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-6 flex items-start space-x-3 text-rose-200">
            <FiAlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-bold block">Job Search Error</strong>
              <span className="text-xs text-rose-300 leading-relaxed">
                {errorMessage || 'Job search is temporarily unavailable. Please try again.'}
              </span>
            </div>
          </div>
        )}

        {/* SUCCESS State & Job Results */}
        {searchStatus === 'SUCCESS' && jobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Compatible Job Openings ({jobs.length})</h2>

            <div className="space-y-4">
              {jobs.map((job, idx) => (
                <JobCard key={job.id || idx} job={job} onOptimize={handleOptimizeForJob} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
