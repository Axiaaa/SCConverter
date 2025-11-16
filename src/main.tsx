import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ByteStream } from './bytestream';

const formatHex = (hex: string, spaced: boolean): string => {
  const cleaned = hex.replace(/\s/g, '');
  if (!spaced) return cleaned;
  return cleaned.match(/.{1,2}/g)?.join(' ') || cleaned;
}

const stringToHex = (str: string): string => {
  const bs = new ByteStream();
  bs.writeString(str)
  return bs.getHex();
}

const hexToString = (hex: string): string => {
  const bs = new ByteStream()
  bs.writeInt(hex.length)
  bs.writeHexa(hex);
  bs.offset = 0
  return bs.readString();
}

const hexToVInt = (hex: string): string => {
  const bs = new ByteStream();
  bs.writeHexa(hex);
  bs.offset = 0;
  const val = bs.readVInt();
  if (val == -64)
    return "-1"
  else 
    return val.toString()
}

const vIntToHex = (vint: string): string => {
  const bs = new ByteStream();
  bs.writeVInt(Number(vint))
  return bs.getHex(true)
}

const IntToHex = (nbr: string): string => {
  const bs = new ByteStream();

  const long = nbr.split(/[ ,]+/);
  if (long.length != 0)
  {
    bs.writeLong(Number(long[0]), Number(long[1]));
    return bs.getHex(true)
  }

  const num = Number(nbr);
  if (num > 2147483647 || num < -2147483648) {
    bs.writeLongLong(num);
  } else {
    bs.writeInt(num);
  }
  return bs.getHex(true);
}

const HexToInt = (hex: string): string => {
  console.log(hex);
  const bs = new ByteStream();
  bs.writeHexa(hex);
  bs.offset = 0;
  let str = "Long: "
  str += bs.readLong().toString()
  str += "\n"
  bs.offset = 0;
  str += "Int: "
  str += bs.readInt().toString()
  return str;
}

const App: React.FC = () => {
  const [hexValue, setHexValue] = useState('');
  const [stringValue, setStringValue] = useState('');
  const [vIntValue, setVIntValue] = useState('');
  const [IntValue, setIntValue] = useState('')
  const [activeInput, setActiveInput] = useState<'hex' | 'string' | 'vint' | 'int' | null>(null);
  const [hexSpaced, setHexSpaced] = useState(false);
  const clearTextZone = () => { 
    setActiveInput(null)
    setHexValue('')
    setStringValue('')
    setVIntValue('')
    setIntValue('')
  }

  useEffect(() => {
    if (hexValue) {
      setHexValue(prev => formatHex(prev, hexSpaced));
    }
  }, [hexSpaced]);

  useEffect(() => {
    if (activeInput === 'hex') {
      setStringValue(hexToString(hexValue));
      setVIntValue(hexToVInt(hexValue));
      setIntValue(HexToInt(hexValue))
    }
  }, [hexValue, activeInput]);

  useEffect(() => {
    if (activeInput === 'string') {
      const hex = stringToHex(stringValue);
      setHexValue(formatHex(hex, hexSpaced));
      setVIntValue(hexToVInt(hex));
    }
  }, [stringValue, activeInput, hexSpaced]);

  useEffect(() => {
    if (activeInput === 'vint') {
      const hex = vIntToHex(vIntValue);
      setHexValue(formatHex(hex, hexSpaced));
      setStringValue(hexToString(hex));
    }
  }, [vIntValue, activeInput, hexSpaced]);

  useEffect(() => {
    if (activeInput === 'int') {
      const hex = IntToHex(IntValue);
      setHexValue(formatHex(hex, hexSpaced));
    }
  }, [IntValue, activeInput, hexSpaced]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-3">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-br from-blue-400 to-purple-500 mb-3">
            Data Converter
          </h1>
          <p className="text-gray-400 text-base">Real-time converter</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-10 space-y-3">
            <div className="flex justify-center">
            <button
              onClick={() => clearTextZone()}
              className={`px-15 py-2.5 rounded-lg text-sm font-bold transition-all ${
                'bg-slate-700 text-gray-300 hover:bg-linear-to-br from-blue-400 to-purple-500 mb-3 hover:shadow-lg hover:shadow-blue-500/30'
              }`}
              >
              Reset
            </button>
            </div>
          {/* String Input */}
          <div className="group">
            <label className="flex text-lg font-semibold text-blue-400 mb-3  items-center gap-3">
              <span className="w-2.5 h-2.5 bg-blue-400 rounded-full shrink-0"></span>
              <span className="flex-1">String</span>
            </label>
            <textarea
              value={stringValue}
              onChange={(e) => {
                setActiveInput('string');
                setStringValue(e.target.value);
              }}
              placeholder="Enter text here..."
              className="w-full px-3 py-2 bg-slate-900/50 border-2 border-slate-700 text-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-mono text-base resize-none placeholder-gray-500"
              rows={3}
            />
          </div>

          {/* Hex Input */}
          <div className="group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full shrink-0"></span>
                <span className="text-lg font-semibold text-green-400">Hexadecimal</span>
              </div>
              <button
                onClick={() => setHexSpaced(!hexSpaced)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  hexSpaced
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {hexSpaced ? 'Spaced' : 'Compact'}
              </button>
            </div>
            <textarea
              value={hexValue}
              onChange={(e) => {
                setActiveInput('hex');
                setHexValue(e.target.value);
              }}
              placeholder="Enter hex values (e.g., 48656c6c6f)..."
              className="w-full px-5 py-4 bg-slate-900/50 border-2 border-slate-700 text-gray-100 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all font-mono text-base resize-none placeholder-gray-500"
              rows={3}
            />
          </div>


          {/* VInt Input */}
          <div className="group">
            <label className="flex text-lg font-semibold text-purple-400 mb-3  items-center gap-3">
              <span className="w-2.5 h-2.5 bg-purple-400 rounded-full shrink-0"></span>
              <span className="flex-1">VInt</span>
            </label>
            <textarea
              value={vIntValue}
              onChange={(e) => {
                setActiveInput('vint');
                setVIntValue(e.target.value);
              }}
              placeholder="Enter VInt bytes (e.g., ac 02)..."
              className="w-full px-5 py-4 bg-slate-900/50 border-2 border-slate-700 text-gray-100 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all font-mono text-base resize-none placeholder-gray-500"
              rows={3}
            />
          </div>

          <div className="group">
            <label className="flex text-lg font-semibold text-yellow-400 mb-3 items-center gap-3">
              <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span>
              <span className="flex-1">Int/Long</span>
            </label>
            <textarea
              value={IntValue}
              onChange={(e) => {
                setActiveInput('int');
                setIntValue(e.target.value);
              }}
              placeholder="Enter VInt bytes (e.g., ac 02)..."
              className="w-full px-5 py-4 bg-slate-900/50 border-2 border-slate-700 text-gray-100 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all font-mono text-base resize-none placeholder-gray-500"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>

  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}