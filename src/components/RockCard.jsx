import React from "react";
import { User, Target, MessageSquare } from "lucide-react";


const RockCard = ({ rock, extra }) => {
    console.log('RockCard: received rock data', rock);
    
    // Use backend fields
    const name = rock.assigned_to_name || "-";
    const rockName = rock.rock_name || "Untitled Rock";
    const objective = rock.smart_objective || "No objective specified";
    
    console.log('RockCard: extracted fields', { name, rockName, objective, tasks: rock.tasks });
    
    // Truncate rock name for display
    const truncateText = (text, wordLimit = 4) => {
        const words = text.split(' ');
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    return (
        <div className="min-w-[360px] max-w-[360px] h-full bg-white rounded-lg shadow border border-gray-200 flex flex-col transition-all duration-300 relative hover:shadow-md hover:-translate-y-1 cursor-pointer mr-4 mt-2 overflow-hidden" style={{ maxHeight: 480, minHeight: 320 }}>
            {extra}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-4 py-3 rounded-t-lg flex items-center justify-between pr-24">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Target size={16} className="text-blue-600 flex-shrink-0" />
                    <h3 
                        className="font-semibold text-base text-gray-800 truncate flex-1" 
                        title={rockName}
                    >
                        {truncateText(rockName, 4)}
                    </h3>
                </div>
            </div>
            <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto" style={{ minHeight: 180, maxHeight: 380 }}>
                <div>
                    <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide flex items-center gap-1">
                        <User size={10} className="text-gray-400" />
                        Owner
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                        <span className="text-sm text-gray-800 font-medium block">{name}</span>
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Summary</div>
                    <div className="text-xs text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-2 italic">
                        {objective}
                    </div>
                </div>
                {/* Show all tasks below the objective */}
                {rock.tasks && Array.isArray(rock.tasks) && rock.tasks.length > 0 && (
                    <div className="mt-2">
                        <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Milestones ({rock.tasks.length})</div>
                        <ul className="list-disc pl-5 text-sm text-gray-700 max-h-40 overflow-y-auto">
                            {rock.tasks.map((task, idx) => (
                                <li key={task.task_id || idx}>{task.task}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RockCard;