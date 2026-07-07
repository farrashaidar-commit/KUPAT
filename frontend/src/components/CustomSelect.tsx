import { useState, useRef, useEffect, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomSelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  disabled = false,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const selectedLabel = selectedOption?.label || placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.focus();
          break;
        case 'Tab':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options, onChange]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      const targetItem = items[highlightedIndex] as HTMLElement | undefined;
      if (targetItem && typeof targetItem.scrollIntoView === 'function') {
        targetItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback((optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onChange]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(prev => !prev);
      if (!isOpen) {
        setHighlightedIndex(-1);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        ref={inputRef}
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full appearance-none bg-[#111928] border border-[#243041] rounded-xl px-3.5 py-2.5 text-sm text-gray-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] cursor-pointer transition-all duration-200 flex items-center justify-between group ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isOpen
            ? 'border-indigo-400 bg-[#142033] ring-2 ring-indigo-500/20'
            : 'hover:border-indigo-400/60 hover:bg-[#142033]'
        } ${
          value && !isOpen ? 'text-gray-100 font-medium' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate text-left">{selectedLabel}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-indigo-400/60 transition-colors" />
        </motion.div>
      </button>

      {/* Dropdown List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <ul
              ref={listRef}
              role="listbox"
              className="bg-[#111928] border border-[#243041] rounded-xl shadow-2xl max-h-64 overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#1e293b #111928',
              }}
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={String(value) === String(option.value)}
                  data-value={option.value}
                  className={`cursor-pointer transition-all duration-150 text-sm overflow-hidden`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseLeave={() => setHighlightedIndex(-1)}
                  onClick={() => handleSelect(option.value)}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className={`px-3.5 py-2.5 cursor-pointer ${
                      String(value) === String(option.value)
                        ? 'bg-indigo-600/20 text-indigo-300 font-medium border-l-2 border-indigo-600 pl-3'
                        : highlightedIndex === index
                        ? 'bg-[#1a2638] text-gray-100'
                        : 'text-gray-200 hover:bg-[#1a2638]/50'
                    }`}
                  >
                    {option.label}
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Style */}
      <style>{`
        [role="listbox"]::-webkit-scrollbar {
          width: 6px;
        }
        [role="listbox"]::-webkit-scrollbar-track {
          background: #111928;
          border-radius: 0.75rem;
        }
        [role="listbox"]::-webkit-scrollbar-thumb {
          background: #243041;
          border-radius: 0.75rem;
        }
        [role="listbox"]::-webkit-scrollbar-thumb:hover {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
}
