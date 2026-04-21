import { memo } from "react";
import { TrendingUp, Sigma, Calculator, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BandMode } from "@/hooks/win-loss/useWinLossScenarios";

interface Stats {
  stdDev: number;
  fitN: number;
  dof: number;
  meanX: number;
  confidenceZ: number;
  bandMode: BandMode;
  tCritical: number | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: Stats;
}

/** Mini SVG: 4 pontos com reta OLS e resíduos pontilhados. Tokens semânticos. */
function OlsMiniChart() {
  // Pontos demo (x, y) — exemplo y ≈ 4.1x + 10.1
  const pts = [
    { x: 0, y: 10 },
    { x: 1, y: 14 },
    { x: 2, y: 19 },
    { x: 3, y: 22 },
  ];
  // Reta ŷ = 4.1x + 10.1
  const yhat = (x: number) => 4.1 * x + 10.1;
  // Mapeamento para SVG (240×80, padding 12)
  const px = (x: number) => 12 + (x / 3) * 216;
  const py = (y: number) => 80 - 12 - ((y - 8) / 16) * 56;

  return (
    <svg
      viewBox="0 0 240 80"
      className="w-full h-20 rounded-md border bg-muted/20"
      role="img"
      aria-label="Reta de regressão OLS com resíduos"
    >
      {/* Reta OLS */}
      <line
        x1={px(0)}
        y1={py(yhat(0))}
        x2={px(3)}
        y2={py(yhat(3))}
        stroke="hsl(var(--primary))"
        strokeWidth={1.5}
      />
      {/* Resíduos pontilhados + pontos observados */}
      {pts.map((p, i) => (
        <g key={i}>
          <line
            x1={px(p.x)}
            y1={py(p.y)}
            x2={px(p.x)}
            y2={py(yhat(p.x))}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          <circle cx={px(p.x)} cy={py(p.y)} r={2.5} fill="hsl(var(--foreground))" />
        </g>
      ))}
      {/* Label discreto */}
      <text
        x={232}
        y={18}
        textAnchor="end"
        className="fill-muted-foreground"
        style={{ fontSize: 9, fontFamily: "monospace" }}
      >
        ŷ = β₀ + β₁·x
      </text>
    </svg>
  );
}

function Section({
  icon: Icon,
  step,
  title,
  children,
}: {
  icon: typeof TrendingUp;
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold tabular-nums">
          {step}
        </div>
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="pl-8 space-y-1.5 text-xs text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Formula({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <code
      aria-label={label}
      className="block w-full px-3 py-2 rounded-md bg-muted/50 border font-mono text-[11px] text-foreground tabular-nums whitespace-pre-wrap"
    >
      {children}
    </code>
  );
}

export const ScenarioFormulaExplainerDialog = memo(function ScenarioFormulaExplainerDialog({
  open,
  onOpenChange,
  stats,
}: Props) {
  const { stdDev, fitN, dof, meanX, confidenceZ, bandMode, tCritical } = stats;
  const hasFit = fitN >= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" aria-hidden />
            Como as bandas são calculadas?
          </DialogTitle>
          <DialogDescription>
            Da reta de regressão até o intervalo de previsão da OLS, em 4 passos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <Section icon={TrendingUp} step={1} title="Ajustamos uma reta (OLS)">
            <p>
              Sobre a série histórica de winRate, encontramos a reta que minimiza a soma dos
              quadrados dos resíduos (diferença entre ponto observado e previsto):
            </p>
            <Formula label="y chapéu igual a beta zero mais beta um vezes x">
              ŷ = β₀ + β₁·x{"\n"}resíduo = y − ŷ
            </Formula>
            <OlsMiniChart />
            <p className="text-[10px]">
              Pontos pretos = observados · linha = ajuste OLS · pontilhado = resíduo
            </p>
          </Section>

          <Section icon={Sigma} step={2} title="σ residual (SEE) vem dos resíduos">
            <p>
              O <strong className="text-foreground">Standard Error of the Estimate</strong> mede o
              desvio típico dos pontos em torno da reta — não em torno da média:
            </p>
            <Formula label="sigma chapéu igual à raiz quadrada de SSE dividido por n menos dois">
              σ̂ = √( SSE / (n − 2) ){"\n"}SSE = Σ (y − ŷ)²
            </Formula>
            {hasFit ? (
              <p>
                <span className="text-foreground">Nos seus dados:</span>{" "}
                <span className="font-mono tabular-nums">
                  σ = {stdDev.toFixed(2)}pp · n = {fitN} · dof = {dof}
                </span>
              </p>
            ) : (
              <p className="italic">Sem ajuste ainda — necessário ≥ 3 períodos.</p>
            )}
          </Section>

          <Section icon={Calculator} step={3} title="Largura da banda no horizonte x">
            <p>
              O σ residual é inflado pelo fator do prediction interval da OLS. A banda{" "}
              <strong className="text-foreground">abre</strong> conforme x se afasta do centro x̄
              dos dados:
            </p>
            <Formula label="largura igual a z vezes sigma vezes raiz de um mais um sobre n mais x menos x barra ao quadrado dividido por Sxx">
              width(x) = z · σ · √( 1 + 1/n + (x − x̄)² / Sxx )
            </Formula>
            <ul className="space-y-1 list-none pl-0">
              <li>
                <code className="text-foreground font-mono">1</code> → variância irredutível de uma observação futura
              </li>
              <li>
                <code className="text-foreground font-mono">1/n</code> → incerteza no intercept (β₀)
              </li>
              <li>
                <code className="text-foreground font-mono">(x−x̄)² / Sxx</code> → incerteza no slope
                — é isso que faz a banda <em>abrir no horizonte</em>
              </li>
            </ul>
            {hasFit && (
              <p>
                <span className="text-foreground">Nos seus dados:</span>{" "}
                <span className="font-mono tabular-nums">x̄ = {meanX.toFixed(2)}</span>
              </p>
            )}
          </Section>

          <Section icon={Target} step={4} title="Multiplicador define a cobertura">
            <p>
              O multiplicador na frente de σ controla qual % de cobertura você quer:
            </p>
            <Formula>
              {"SEE z=1.00  →  ~68%   (1 desvio-padrão)\n"}
              {"SEE z=1.28  →  ~80%\n"}
              {"SEE z=1.645 →  ~90%\n"}
              {"SEE z=1.96  →  ~95%\n"}
              {"PI 95%      →  t-Student (ajusta para n pequeno)"}
            </Formula>
            <p>
              <span className="text-foreground">Modo ativo:</span>{" "}
              <span className="font-mono tabular-nums">
                {bandMode === "pi95"
                  ? `PI 95% · t = ${(tCritical ?? 0).toFixed(2)}`
                  : `SEE · z = ${confidenceZ.toFixed(2)}`}
              </span>
            </p>
            <p className="text-[10px] italic">
              Cenários otimista/pessimista = ŷ(x) ± width(x), com clamp em [0, 100] (winRate é %).
            </p>
          </Section>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)} size="sm">
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
