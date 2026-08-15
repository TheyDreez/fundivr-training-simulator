import { motion } from 'framer-motion';

export function Home() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center space-y-6"
      >
        {/* Furnace Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-furnace-600 flex items-center justify-center shadow-lg shadow-primary-500/20"
        >
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
            />
          </svg>
        </motion.div>

        {/* Title */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-furnace-500 bg-clip-text text-transparent">
            FundiVR Training Simulator
          </h1>
          <p className="mt-3 text-dark-400 text-lg">
            Simulador de treinamento para operadores de fornos de fusão de alumínio
          </p>
        </div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800 border border-dark-700 text-sm text-dark-300"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Sistema operacional — Sprint 1 concluída
        </motion.div>
      </motion.div>
    </div>
  );
}
