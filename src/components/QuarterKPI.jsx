import React from "react";
import { BarChart2, CheckCircle, AlertCircle, ListChecks, TrendingUp } from "lucide-react";

const kpiData = [
    {
        label: "Quarter Completion",
        value: 72,
        type: "progress",
        icon: <TrendingUp size={24} className="text-blue-500" />,
        tooltip: "Based on completed rocks and milestones",
    },
    {
        label: "Rocks Completed",
        value: 5,
        total: 7,
        icon: <CheckCircle size={24} className="text-green-600" />,
        tooltip: "Number of rocks completed this quarter",
    },
    {
        label: "Milestones Achieved",
        value: 28,
        total: 36,
        icon: <ListChecks size={24} className="text-cyan-600" />,
        tooltip: "Milestones achieved across all rocks",
    },
    {
        label: "Issues Discussed",
        value: 12,
        icon: <AlertCircle size={24} className="text-yellow-600" />,
        tooltip: "Total issues discussed in meetings",
    },
    {
        label: "EOS Health Score",
        value: 86,
        type: "progress",
        icon: <BarChart2 size={24} className="text-indigo-600" />,
        tooltip: "Overall EOS process health",
    },
];

const ProgressBar = ({ value }) => (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${value}%` }}
        />
    </div>
);


const QuarterKPI = ({ data = kpiData }) => (
    <div className="flex flex-row flex-wrap gap-6 w-full">
        {data.map((kpi, idx) => (
            <div
                key={kpi.label}
                className={
                    `bg-white border border-gray-200 rounded-lg shadow-sm px-7 py-5 flex flex-col items-start justify-between ` +
                    `transition-transform duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer ` +
                    `w-full sm:w-[48%] md:w-[32%] xl:w-[24%] min-w-[220px] max-w-full`
                }
                style={{ minHeight: "auto", height: "100%" }}
                title={kpi.tooltip}
            >
                <div className="flex items-center gap-3 mb-2">
                    {kpi.icon}
                    <span className="text-base font-semibold text-gray-800">{kpi.label}</span>
                </div>
                {kpi.type === "progress" ? (
                    <>
                        <div className="w-full flex items-center gap-2 mt-2">
                            <ProgressBar value={kpi.value} />
                            <span className="text-sm font-semibold text-blue-600">{kpi.value}%</span>
                        </div>
                    </>
                ) : (
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                        {kpi.value}
                        {kpi.total && (
                            <span className="text-lg font-medium text-gray-400 ml-1">/ {kpi.total}</span>
                        )}
                    </div>
                )}
            </div>
        ))}
    </div>
);

export default QuarterKPI;