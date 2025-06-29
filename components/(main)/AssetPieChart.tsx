"use client";
import ReactECharts from "echarts-for-react";

export default function AssetPieChart() {
  const assetData = [
    { name: "예치금", value: 5234000, color: "#1e40af", percentage: 45 },
    { name: "조각", value: 3456000, color: "#0891b2", percentage: 30 },
    { name: "공모", value: 2345000, color: "#06b6d4", percentage: 20 },
    { name: "경매", value: 1234000, color: "#67e8f9", percentage: 5 },
  ];

  const option = {
    backgroundColor: "transparent",

    series: [
      {
        name: "자산 분포",
        type: "pie",
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: "#1f2937",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        data: assetData.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color,
          },
        })),
      },
    ],
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl px-4 pt-2">
      <h3 className="text-white text-lg font-semibold text-center">
        내 자산 가치
      </h3>

      <div className="flex items-center h-50 text-center">
        {/* ECharts Pie Chart */}
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "60%" }}
          opts={{ renderer: "svg" }}
        />
        {/* Legend */}
        <div className="flex-1 space-y-3">
          {assetData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-300 text-sm">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  ₩{(item.value / 10000).toFixed(0)}만원
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
