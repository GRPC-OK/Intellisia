export default function TestTailwind() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900">
      <h1 className="text-4xl font-bold text-white mb-4">Tailwind Test</h1>
      <p className="text-lg text-yellow-300">
        이 텍스트가 노란색이면 Tailwind가 정상 적용된 것!
      </p>
      <button className="mt-6 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-700">
        버튼
      </button>
    </div>
  );
}
