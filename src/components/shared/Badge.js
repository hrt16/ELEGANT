export default function Badge({label,color,bg}) {
  return <span className="badge" style={{color,background:bg}}>{label}</span>;
}
