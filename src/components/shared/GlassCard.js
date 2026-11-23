import { useState } from 'react';
import { COLORS } from '../../utils/constants';
export default function GlassCard({children,style={},hover=false,onClick,className=''}) {
  const [hovered,setHovered]=useState(false);
  return (
    <div className={className} onClick={onClick}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{background:hovered&&hover?'rgba(79,142,247,0.08)':COLORS.glass,border:`1px solid ${hovered&&hover?'rgba(79,142,247,0.28)':COLORS.glassBorder}`,borderRadius:16,padding:'1.5rem',transition:'all 0.2s ease',cursor:onClick?'pointer':'default',...style}}>
      {children}
    </div>
  );
}
