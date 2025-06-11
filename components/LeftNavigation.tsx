import React from 'react';

interface SectionInfo {
  id: string;
  title: string;
  icon: string;
}

interface LeftNavigationProps {
  sections: SectionInfo[];
  onNavigate: (sectionId: string) => void;
}

const LeftNavigation: React.FC<LeftNavigationProps> = ({ sections, onNavigate }) => {
  return (
    <nav className="h-full flex flex-col py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar-dark">
        <p className="px-3 pt-2 pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Secciones</p>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onNavigate(section.id)}
          className="w-full flex items-center py-2.5 px-3 rounded-md text-slate-200 hover:bg-slate-700 hover:text-white transition-colors group"
          role="menuitem"
        >
          <i className={`${section.icon} text-lg mr-3 text-slate-400 group-hover:text-blue-300 transition-colors`}></i>
          <span className="text-sm font-medium">{section.title}</span>
        </button>
      ))}
       <div className="mt-auto pt-6 px-3">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} OpenIN Pathfinder.
        </p>
      </div>
    </nav>
  );
};

export default LeftNavigation;
