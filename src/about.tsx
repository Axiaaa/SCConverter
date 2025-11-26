
export const AboutPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-br from-green-400 to-teal-500 mb-3">
            About
          </h1>
          <p className="text-gray-400 text-base">Information about this converter</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-10 space-y-6">
          <button
            onClick={() => onNavigate('converter')}
            className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all bg-slate-700 text-gray-300 hover:bg-linear-to-br from-blue-400 to-purple-500 hover:shadow-lg hover:shadow-blue-500/30"
          >
            ← Back to Converter
          </button>

          <div className="space-y-4 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-2">SC Datatypes Converter</h2>
              <p className="text-gray-400">
                This tool allows you to convert between different data formats used in Supercell games.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-blue-400 mb-2">Supported Formats</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li><strong className="text-blue-300">String:</strong> Standard text strings</li>
                <li><strong className="text-green-300">Hexadecimal:</strong> Byte representation in hex format</li>
                <li><strong className="text-purple-300">VInt:</strong> Variable-length integer encoding</li>
                <li><strong className="text-yellow-300">Int/Long:</strong> Standard and long integers</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-purple-400 mb-2">Usage Notes</h3>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-sm text-gray-400 mb-2"><strong>For Hexadecimal:</strong></p>
                <p className="text-sm text-gray-500">You need to input the entire byte. Example: 00000001 = 1, 1 = 16777216</p>
                
                <p className="text-sm text-gray-400 mb-2 mt-4"><strong>For Long:</strong></p>
                <p className="text-sm text-gray-500">Uses 2 ints encoding. Separate them with a comma or space. Example: 2,3917113 = 00000002003bc539</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-orange-400 mb-2">Structure to Hex Converter</h3>
              <p className="text-gray-400 mb-3">
                The Structure to Hex page allows you to write multiple data instructions and convert them into a hexadecimal dump in real-time.
              </p>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-sm text-gray-400 mb-2"><strong>Supported Instructions:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-500">
                  <li><code className="text-blue-300">writeVInt(value)</code> - Write a variable-length integer</li>
                  <li><code className="text-green-300">writeInt(value)</code> - Write a 32-bit integer</li>
                  <li><code className="text-yellow-300">writeLong(high,low)</code> - Write a long using two integers</li>
                  <li><code className="text-yellow-300">writeLogicLong(high,low)</code> - Write a logic long (VInt encoded)</li>
                  <li><code className="text-purple-300">writeHex(hexValue)</code> - Write raw hexadecimal bytes</li>
                  <li><code className="text-pink-300">writeBoolean(true/false)</code> - Write a boolean value</li>
                  <li><code className="text-teal-300">writeString('text')</code> - Write a string with length prefix</li>
                </ul>
                
                <p className="text-sm text-gray-400 mb-2 mt-4"><strong>Example:</strong></p>
                <pre className="text-sm text-gray-500 bg-slate-800 p-2 rounded overflow-x-auto">
{`writeVInt(3)
writeString('Hello')
writeBoolean(true)
writeInt(42)`}
                </pre>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-teal-400 mb-2">Links</h3>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/Axiaaa/SCConverter" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  GitHub Repository
                </a>
              </div>
             <div className="retard">Feel free to star, contribute or report issues!</div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-2 text-gray-400">Disclaimer</h3>
                <div>This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it.</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
