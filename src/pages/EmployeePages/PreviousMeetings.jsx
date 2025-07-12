
import React, { useEffect, useState, useRef } from "react";
import Layout from "../../components/Layout";
import RagChatbot from "../../components/RagChatbot";
import { useLocation } from "react-router-dom";
import { useGetQuarterQuery, useGetQuarterWithRocksAndTasksQuery } from "../../services/api";

const PreviousMeetings = () => {
  const location = useLocation();
  const { meetingId, quarter_id } = location.state || {};
  const [meeting, setMeeting] = useState(null);
  const calendarRef = useRef(null);
  const token = localStorage.getItem('token');

  // Fetch quarter data, rocks, and tasks from API
  const { data: quarter, isLoading: quarterLoading, error: quarterError } = useGetQuarterQuery({ 
    quarter_id: quarter_id || meetingId, 
    token 
  });
  
  const { data: quarterWithRocksAndTasks, isLoading: rocksTasksLoading, error: rocksTasksError } = useGetQuarterWithRocksAndTasksQuery({ 
    quarter_id: quarter_id || meetingId, 
    token,
    include_comments: false
  });

  // Transform API data to match the expected format
  useEffect(() => {
    if (quarter && quarterWithRocksAndTasks && quarterWithRocksAndTasks.rocks) {
      // Use the rocks data which already includes tasks
      const groupedData = quarterWithRocksAndTasks.rocks.map(rock => {
        // Group tasks by weeks
        const tasksByWeek = {};
        if (rock.tasks && Array.isArray(rock.tasks)) {
          rock.tasks.forEach(task => {
            const weekKey = `Week ${task.week}`;
            if (!tasksByWeek[weekKey]) {
              tasksByWeek[weekKey] = [];
            }
            tasksByWeek[weekKey].push(task.task || task.task_description || task.task_name);
          });
        }

        const milestones = Object.entries(tasksByWeek).map(([week, weekTasks]) => ({
          week,
          tasks: weekTasks
        }));

        return {
          id: rock.rock_id,
          rock_title: rock.rock_name,
          owner: rock.assigned_to_name || 'Unknown',
          smart_objective: rock.smart_objective || rock.description || '',
          review: {
            status: rock.status || 'In Progress',
            comments: rock.review_comments || ''
          },
          milestones: milestones.length > 0 ? milestones : [
            {
              week: 'Week 1',
              tasks: ['No tasks available']
            }
          ]
        };
      });

      // For now, show the first rock's data (you might want to enhance this)
      if (groupedData.length > 0) {
        setMeeting(groupedData[0]);
      }
    }
  }, [quarter, quarterWithRocksAndTasks]);

  if (quarterLoading || rocksTasksLoading) {
    return (
      <Layout>
        <div className="w-full">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading meeting details...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (quarterError || rocksTasksError) {
    return (
      <Layout>
        <div className="w-full">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">
              Error loading meeting data: {quarterError?.message || rocksTasksError?.message || 'Unknown error'}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!meeting) return null;

  return (
    <Layout>
      <div className="w-full mt-2 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Project Header */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-semibold text-2xl mb-2">{meeting.rock_title}</div>
              <div className="text-gray-500 text-base mb-1">Owner: {meeting.owner}</div>
              <div className="text-gray-700 text-base font-medium">Objective: {meeting.smart_objective}</div>
            </div>
            <div className="flex flex-col items-end">
              <span className="px-4 py-1 rounded-md border border-green-200 bg-green-50 text-base font-medium text-green-700 mb-2">{meeting.review.status}</span>
              <span className="text-gray-400 text-sm">{meeting.review.comments}</span>
            </div>
          </div>

          {/* Project Calendar */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Project Calendar</h2>
            <div className="flex gap-2">
              <button
                aria-label="Scroll left"
                className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 shadow-sm transition"
                onClick={() => {
                  calendarRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                aria-label="Scroll right"
                className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 shadow-sm transition"
                onClick={() => {
                  calendarRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto pb-2" ref={calendarRef}>
            <div className="flex gap-4 min-w-[1200px] mt-4">
              {meeting.milestones.map((milestone, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow min-w-[220px] w-56 flex-shrink-0 flex flex-col p-4 transition-all duration-300 relative hover:shadow-2xl hover:-translate-y-2 hover:z-10 cursor-pointer">
                  <div className="font-semibold text-base mb-2">{milestone.week}</div>
                  <div className="flex flex-col gap-2 mt-2">
                    {milestone.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="bg-gray-50 border border-gray-100 rounded-md px-3 py-2 flex flex-row items-start gap-2">
                        <span className="text-blue-400 font-bold text-xs mt-0.5">•</span>
                        <span className="text-sm text-gray-700">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* RAG Chatbot Side Panel */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <RagChatbot quarterId={quarter_id || meetingId} />
        </div>
      </div>
    </Layout>
  );
};

export default PreviousMeetings;
