import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { mathScopeManager } from '../services/mathScopeManager';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export interface PlotConfig {
    functions: string[];
    xMin: number;
    xMax: number;
    yMin?: number;
    yMax?: number;
    steps?: number;
}

interface FunctionPlotProps {
    config: PlotConfig;
    sheetId: string;
}

const colors = [
    'rgb(75, 192, 192)',
    'rgb(255, 99, 132)',
    'rgb(255, 205, 86)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
    'rgb(199, 199, 199)',
    'rgb(83, 102, 147)',
];

export const FunctionPlot: React.FC<FunctionPlotProps> = ({ config, sheetId }) => {
    const { functions, xMin, xMax, yMin, yMax, steps = 200 } = config;

    const generateFunctionData = (expression: string, colorIndex: number) => {
        try {
            const scope = mathScopeManager.getScope(sheetId);
            const stepSize = (xMax - xMin) / steps;
            const points: { x: number; y: number }[] = [];

            for (let i = 0; i <= steps; i++) {
                const x = xMin + i * stepSize;
                try {
                    // Crear un scope temporal con la variable x
                    const tempScope = new Map([...scope.entries(), ['x', x]]);
                    const node = mathScopeManager.parse(expression);
                    const compiled = node.compile();
                    const y = compiled.evaluate(tempScope);

                    if (typeof y === 'number' && isFinite(y)) {
                        points.push({ x, y });
                    }
                } catch {
                    // Skip points that can't be evaluated
                }
            }

            return {
                label: expression,
                data: points,
                borderColor: colors[colorIndex % colors.length],
                backgroundColor: colors[colorIndex % colors.length] + '20',
                pointRadius: 0,
                tension: 0.1,
                fill: false,
            };
        } catch (error) {
            console.error(`Error plotting function ${expression}:`, error);
            return {
                label: `${expression} (error)`,
                data: [],
                borderColor: 'red',
                backgroundColor: 'red',
                pointRadius: 0,
            };
        }
    }; const data = {
        datasets: functions.map((func, index) => generateFunctionData(func, index)),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Gráfica de: ${functions.join(', ')}`,
            },
        },
        scales: {
            x: {
                type: 'linear' as const,
                display: true,
                title: {
                    display: true,
                    text: 'x',
                },
                min: xMin,
                max: xMax,
            },
            y: {
                type: 'linear' as const,
                display: true,
                title: {
                    display: true,
                    text: 'y',
                },
                min: yMin,
                max: yMax,
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
        elements: {
            point: {
                radius: 0,
                hoverRadius: 4,
            },
        },
    };

    return (
        <div className="w-full h-96 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Line data={data} options={options} />
        </div>
    );
};
