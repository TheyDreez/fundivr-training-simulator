import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createStudent, createSession } from '../services/api';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import { HardHat, LogIn } from 'lucide-react';

export function Entry() {
  const [registration, setRegistration] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const setStudent = useSimulatorStore((s) => s.setStudent);
  const setSession = useSimulatorStore((s) => s.setSession);
  const resetStore = useSimulatorStore((s) => s.reset);

  const startMutation = useMutation({
    mutationFn: async () => {
      // Cria/recupera aluno
      const student = await createStudent({ registration, name });
      // Inicia sessão
      const session = await createSession(student.id);
      return { student, session };
    },
    onSuccess: (data) => {
      resetStore();
      setStudent(data.student);
      setSession(data.session);
      navigate('/simulador');
    },
    onError: (err) => {
      console.error(err);
      alert('Erro ao iniciar sessão. Verifique os dados e a conexão.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;
    startMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-amber-500/10 p-4 rounded-full mb-4 ring-1 ring-amber-500/30">
            <HardHat className="w-12 h-12 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-wider">FundiVR</h1>
          <p className="text-slate-400 text-sm mt-1">Simulador de Treinamento em Fundição</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Matrícula</label>
            <input
              type="text"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              placeholder="Ex: MAT-1234"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome (Opcional)</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={startMutation.isPending || !registration}
            className="w-full mt-6 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {startMutation.isPending ? (
              <span className="animate-pulse">Conectando...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Iniciar Treinamento
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
