import { COLORS } from '../../utils/constants';
export default function CircularProgress({value,size=80,color=COLORS.accent,label}) {
  const sw=8, r=(size-sw)/2, circ=2*Math.PI*r, offset=circ-(value/100)*circ;
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:'stroke-dashoffset 0.9s ease'}}/>
        <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={14} fontWeight={700} fontFamily="Inter,sans-serif">{value}%</text>
      </svg>
      {label&&<span style={{fontSize:11,color:COLORS.slateLight,textAlign:'center'}}>{label}</span>}
    </div>
  );
}
