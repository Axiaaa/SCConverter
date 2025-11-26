import './index.css';
import React, { useState, useEffect } from 'react';
import { ByteStream} from './bytestream';



export const StructureToHexPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {

  const [StructureValue, SetStructureValue] = useState('');
  const [HexdumpValue, SetHexdumpValue] = useState('');

  const clearStucture = () => {
    SetHexdumpValue('')
    SetStructureValue('')
  }

  const getHexfromInstructions = (instructions: {type: string; args: string;}[] ) => {
    const bs = new ByteStream();
    for (let inst of instructions) {
      switch(inst.type) {
        case 'vint':
          bs.writeVInt(parseInt(inst.args));
          break;
        case 'int':
          bs.writeInt(parseInt(inst.args));
          break;
        case 'long':
          let args = inst.args.split(",")
          bs.writeLong(parseInt(args[0]), parseInt(args[1]));
          break;
        case 'logiclong':
          let arg = inst.args.split(",")
          bs.writeLogicLong(parseInt(arg[0]), parseInt(arg[1]));
          break;
        case 'hex':
        case 'hexa':
          bs.writeHex(inst.args);
          break;
        case 'boolean':
          bs.writeBoolean(inst.args.toLowerCase() === 'true');
          break;
        case 'string':
          bs.writeString(inst.args.replace(/['"]/g, ''));
          break;
      }
    }
    return bs.getHex(true);
  }


  const convertToHex = (structure: string) => {
    let instructions = []
    try {
      let lines = structure.split('\n');
      
      for (let l of lines) {
        l = l.trim();
        if (!l || !l.toLowerCase().includes("write")) {
          continue;
        }
        
        const writeMatch = l.match(/write(\w+)\s*\((.*?)\)/);
        const validTypes = ["vint", "int", "hex", "hexa", "boolean", "string", "long", "logiclong"];
          if (!writeMatch || writeMatch[2] == '' || !validTypes.includes(writeMatch[1].toLocaleLowerCase())) { continue; }

        instructions.push({
           type: writeMatch[1].toLocaleLowerCase(),
           args: writeMatch[2]
          })
      }

      const hexdump = getHexfromInstructions(instructions);
      return hexdump;
    } catch (error) {      return 'Error in conversion';
    }
  };


  useEffect(() => {
    const result = convertToHex(StructureValue);
    SetHexdumpValue(result);
  }, [StructureValue]);


  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-3">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-br from-red-400 to-purple-500 mb-3">
            Structure dumper
          </h1>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-10 space-y-3">
          <div className="flex justify-center gap-4">
            <button
            className="px-15 py-2.5 rounded-lg text-sm font-bold transition-all bg-slate-700 text-gray-300 hover:bg-linear-to-br from-blue-400 to-purple-500 mb-3 hover:shadow-lg hover:shadow-blue-500/30"
            onClick={ () => clearStucture()}
            >
              Reset
            </button>
            <button
              onClick={() => {
                onNavigate('converter');
              }}
              className="px-15 py-2.5 rounded-lg text-sm font-bold transition-all bg-slate-700 text-gray-300 hover:bg-linear-to-br from-red-400 to-purple-400 mb-3 hover:shadow-lg hover:shadow-green-500/30"
            >
              Converter
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="px-15 py-2.5 rounded-lg text-sm font-bold transition-all bg-slate-700 text-gray-300 hover:bg-linear-to-br from-green-400 to-teal-500 mb-3 hover:shadow-lg hover:shadow-green-500/30"
            >
              About
            </button>

          </div>

        
          {/* Hex Input */}
          <div className="group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full shrink-0"></span>
                <span className="text-lg font-semibold text-green-400">Structure</span>
              </div>
            </div>
            <textarea
              value={StructureValue}
              onChange={(e) => {
                SetStructureValue(e.target.value);
              }}
              placeholder="Enter structures (e.g. writeVInt(3), writeString('ee'), writeBoolean(true))..."
              className="w-full px-5 py-4 bg-slate-900/50 border-2 border-slate-700 text-gray-100 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all font-mono text-base resize-y placeholder-gray-500"
              rows={3}
            />
          </div>


                   {/* Hexdump Output - Only show if structure has content */}
          {StructureValue.trim() && (
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-purple-400 rounded-full shrink-0"></span>
                  <span className="text-lg font-semibold text-purple-400">Hexdump</span>
                </div>
              </div>
              <textarea
                value={HexdumpValue}
                readOnly
                placeholder="Converted hexdump will appear here..."
                className="w-full px-5 py-4 bg-slate-900/50 border-2 border-slate-700 text-gray-100 rounded-xl font-mono text-base resize-none placeholder-gray-500 cursor-default"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};