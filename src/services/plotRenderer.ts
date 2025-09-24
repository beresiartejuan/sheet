import { PlotConfig } from '../components/FunctionPlot';
import { mathScopeManager } from './mathScopeManager';

export class PlotRenderer {
    /**
     * Genera una gráfica y la devuelve como Data URL de canvas
     */
    static async generatePlotImage(config: PlotConfig, sheetId: string): Promise<string> {
        return new Promise((resolve) => {
            const { functions, xMin, xMax, steps = 200 } = config;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            // Configurar el canvas
            canvas.width = 800;
            canvas.height = 600;

            // Colores para las funciones
            const colors = [
                '#4F46E5', // Indigo
                '#EF4444', // Red
                '#F59E0B', // Amber
                '#10B981', // Emerald
                '#8B5CF6', // Violet
                '#F97316', // Orange
                '#6B7280', // Gray
                '#EC4899', // Pink
            ];

            // Limpiar el canvas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calcular datos de las funciones
            const allPoints: Array<{ x: number, y: number, color: string, label: string }[]> = [];
            let globalYMin = Infinity;
            let globalYMax = -Infinity;

            functions.forEach((expression, funcIndex) => {
                const points: { x: number, y: number, color: string, label: string }[] = [];
                const stepSize = (xMax - xMin) / steps;

                for (let i = 0; i <= steps; i++) {
                    const x = xMin + i * stepSize;
                    try {
                        const scope = mathScopeManager.getScope(sheetId);
                        const tempScope = new Map([...scope.entries(), ['x', x]]);
                        const node = mathScopeManager.parse(expression);
                        const compiled = node.compile();
                        const y = compiled.evaluate(tempScope);

                        if (typeof y === 'number' && isFinite(y)) {
                            points.push({
                                x,
                                y,
                                color: colors[funcIndex % colors.length],
                                label: expression
                            });
                            globalYMin = Math.min(globalYMin, y);
                            globalYMax = Math.max(globalYMax, y);
                        }
                    } catch {
                        // Skip points that can't be evaluated
                    }
                }
                allPoints.push(points);
            });

            // Si no hay puntos válidos, mostrar error
            if (allPoints.every(points => points.length === 0)) {
                ctx.fillStyle = '#EF4444';
                ctx.font = '24px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Error: No se pudieron evaluar las funciones', canvas.width / 2, canvas.height / 2);
                resolve(canvas.toDataURL());
                return;
            }

            // Configurar márgenes y área de dibujo
            const margin = 80;
            const plotWidth = canvas.width - 2 * margin;
            const plotHeight = canvas.height - 2 * margin;

            // Ajustar rango Y si es necesario
            const yRange = globalYMax - globalYMin;
            const yPadding = yRange * 0.1;
            const yMin = config.yMin ?? (globalYMin - yPadding);
            const yMax = config.yMax ?? (globalYMax + yPadding);

            // Funciones de transformación
            const scaleX = (x: number) => margin + ((x - xMin) / (xMax - xMin)) * plotWidth;
            const scaleY = (y: number) => margin + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight;

            // Dibujar grid y ejes
            this.drawGrid(ctx, canvas.width, canvas.height, margin, xMin, xMax, yMin, yMax, scaleX, scaleY);

            // Dibujar las funciones
            allPoints.forEach((points) => {
                if (points.length === 0) return;

                ctx.strokeStyle = points[0].color;
                ctx.lineWidth = 2;
                ctx.beginPath();

                let started = false;
                points.forEach((point) => {
                    const x = scaleX(point.x);
                    const y = scaleY(point.y);

                    if (!started) {
                        ctx.moveTo(x, y);
                        started = true;
                    } else {
                        ctx.lineTo(x, y);
                    }
                });

                ctx.stroke();
            });

            // Dibujar leyenda
            this.drawLegend(ctx, functions, colors, margin);

            resolve(canvas.toDataURL());
        });
    }

    private static drawGrid(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        margin: number,
        xMin: number,
        xMax: number,
        yMin: number,
        yMax: number,
        scaleX: (x: number) => number,
        scaleY: (y: number) => number
    ) {
        const plotWidth = width - 2 * margin;
        const plotHeight = height - 2 * margin;

        // Fondo del área de gráfica
        ctx.fillStyle = '#FAFAFA';
        ctx.fillRect(margin, margin, plotWidth, plotHeight);

        // Grid
        ctx.strokeStyle = '#E5E5E5';
        ctx.lineWidth = 1;

        // Líneas verticales del grid
        const xSteps = 10;
        for (let i = 0; i <= xSteps; i++) {
            const x = xMin + (i / xSteps) * (xMax - xMin);
            const canvasX = scaleX(x);
            ctx.beginPath();
            ctx.moveTo(canvasX, margin);
            ctx.lineTo(canvasX, margin + plotHeight);
            ctx.stroke();
        }

        // Líneas horizontales del grid
        const ySteps = 10;
        for (let i = 0; i <= ySteps; i++) {
            const y = yMin + (i / ySteps) * (yMax - yMin);
            const canvasY = scaleY(y);
            ctx.beginPath();
            ctx.moveTo(margin, canvasY);
            ctx.lineTo(margin + plotWidth, canvasY);
            ctx.stroke();
        }

        // Ejes principales
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;

        // Eje X (y=0 si está en rango)
        if (yMin <= 0 && yMax >= 0) {
            const y0 = scaleY(0);
            ctx.beginPath();
            ctx.moveTo(margin, y0);
            ctx.lineTo(margin + plotWidth, y0);
            ctx.stroke();
        }

        // Eje Y (x=0 si está en rango)
        if (xMin <= 0 && xMax >= 0) {
            const x0 = scaleX(0);
            ctx.beginPath();
            ctx.moveTo(x0, margin);
            ctx.lineTo(x0, margin + plotHeight);
            ctx.stroke();
        }

        // Bordes del área de gráfica
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.strokeRect(margin, margin, plotWidth, plotHeight);

        // Labels de los ejes
        ctx.fillStyle = '#374151';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';

        // Labels eje X
        for (let i = 0; i <= xSteps; i++) {
            const x = xMin + (i / xSteps) * (xMax - xMin);
            const canvasX = scaleX(x);
            ctx.fillText(x.toFixed(1), canvasX, height - margin + 25);
        }

        // Labels eje Y
        ctx.textAlign = 'right';
        for (let i = 0; i <= ySteps; i++) {
            const y = yMin + (i / ySteps) * (yMax - yMin);
            const canvasY = scaleY(y);
            ctx.fillText(y.toFixed(1), margin - 10, canvasY + 5);
        }
    }

    private static drawLegend(
        ctx: CanvasRenderingContext2D,
        functions: string[],
        colors: string[],
        margin: number
    ) {
        const legendY = margin + 20;
        let legendX = margin + 20;

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';

        functions.forEach((func, index) => {
            // Línea de color
            ctx.strokeStyle = colors[index % colors.length];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(legendX, legendY);
            ctx.lineTo(legendX + 30, legendY);
            ctx.stroke();

            // Texto
            ctx.fillStyle = '#374151';
            ctx.fillText(func, legendX + 40, legendY + 5);

            legendX += ctx.measureText(func).width + 80;
        });
    }
}
