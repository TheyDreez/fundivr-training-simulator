import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import type { SessionWithOccurrences } from '../services/api';
import { finishSession, getSession } from '../services/api';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { TRAINING_STAGES } from '@fundivr/shared-types';
import { RotateCcw, AlertOctagon, AlertTriangle } from 'lucide-react';

export function Debrief() {
  const { session, student, accumulatedScore, stageScores, reset } = useSimulatorStore();
  const navigate = useNavigate();

  const [data, setData] = useState<SessionWithOccurrences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    async function loadData() {
      try {
        await finishSession(session!.id);
        const fullSession = await getSession(session!.id);
        setData(fullSession);
      } catch (err) {
        console.error('Erro ao finalizar sessão', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-xl animate-pulse text-amber-500">Compilando Resultados...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-xl text-rose-500">Erro ao carregar os dados.</div>
      </div>
    );
  }

  // Prepara dados para o gráfico de Radar (Competências)
  const chartData = [
    { subject: 'EPI & Seg', A: stageScores[TRAINING_STAGES.PPE] || 0, fullMark: 100 },
    { subject: 'Carga', A: stageScores[TRAINING_STAGES.CHARGE] || 0, fullMark: 100 },
    { subject: 'Térmica', A: stageScores[TRAINING_STAGES.THERMAL] || 0, fullMark: 100 },
    { subject: 'Escumação', A: stageScores[TRAINING_STAGES.SKIMMING] || 0, fullMark: 100 },
    { subject: 'Emergência', A: stageScores[TRAINING_STAGES.EMERGENCY] || 0, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-5xl mx-auto w-full">
        <header className="flex items-end justify-between mb-12 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-widest text-amber-500">
              Debriefing
            </h1>
            <div className="text-slate-400 mt-2">
              Operador:{' '}
              <span className="text-slate-200">
                {student?.name} ({student?.registration})
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500 uppercase tracking-widest mb-1">
              Score Global Final
            </div>
            <div className="text-5xl font-mono font-bold text-emerald-400">
              {data.score || accumulatedScore}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Radar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center shadow-xl">
            <h2 className="text-lg font-semibold text-slate-300 mb-6 uppercase tracking-wider">
              Desempenho por Competência
            </h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      color: '#f8fafc',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occurrences */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl flex flex-col">
            <h2 className="text-lg font-semibold text-slate-300 mb-6 uppercase tracking-wider">
              Registro de Ocorrências
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {data.occurrences.length === 0 ? (
                <div className="text-emerald-500 bg-emerald-950/30 p-4 rounded-lg text-sm text-center border border-emerald-500/20">
                  Nenhuma ocorrência registrada. Excelente operação!
                </div>
              ) : (
                data.occurrences.map((occ) => (
                  <div
                    key={occ.id}
                    className={`p-4 rounded-lg border flex gap-3 items-start
                    ${occ.severity === 'critical' ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' : 'bg-amber-950/40 border-amber-500/30 text-amber-200'}
                  `}
                  >
                    <div className="mt-0.5">
                      {occ.severity === 'critical' ? (
                        <AlertOctagon className="w-5 h-5 text-rose-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="font-bold uppercase text-xs opacity-75 mr-2">
                        [{occ.severity}]
                      </span>
                      {occ.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <button
            onClick={() => {
              reset();
              navigate('/');
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-4 px-8 rounded-lg transition-colors flex items-center gap-3 border border-slate-700"
          >
            <RotateCcw className="w-5 h-5" />
            Nova Sessão de Treinamento
          </button>
        </div>
      </div>
    </div>
  );
}
