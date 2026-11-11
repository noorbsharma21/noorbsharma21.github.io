/* Hand-drawn ink for the curation pages.
   Every line is a true shape nudged off true by a seeded random, then
   joined with a smooth curve, so the same seed always draws the same
   wobble and a page does not redraw differently on every resize. */
const Ink=(()=>{
  function rng(seed){
    return ()=>{ seed|=0; seed=seed+0x6D2B79F5|0;
      let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t;
      return ((t^t>>>14)>>>0)/4294967296; };
  }
  const f=n=>n.toFixed(1);
  /* Catmull-Rom through the points, written out as cubic curves */
  function smooth(pts){
    let d=`M${f(pts[0][0])} ${f(pts[0][1])}`;
    for(let i=0;i<pts.length-1;i++){
      const p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
      d+=` C${f(p1[0]+(p2[0]-p0[0])/6)} ${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)} ${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  }
  /* a loose circling, the way a pen rings a word: a bit more than one
     turn, opening slightly as it goes */
  function loop(x,y,rx,ry,r,turns=1.18,open=.09){
    const n=Math.max(24,Math.round(34*turns)), a0=r()*Math.PI*2, pts=[];
    for(let i=0;i<=n;i++){
      const a=a0+i/n*turns*Math.PI*2, k=1+(r()-.5)*.05+i/n*open;
      pts.push([x+Math.cos(a)*rx*k, y+Math.sin(a)*ry*k]);
    }
    return smooth(pts);
  }
  /* a bowed arrow with a two-stroke head */
  function arrow(x1,y1,x2,y2,bend,r,head=11){
    const mx=(x1+x2)/2, my=(y1+y2)/2, dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1;
    const qx=mx-dy/L*bend, qy=my+dx/L*bend, pts=[];
    for(let i=0;i<=12;i++){
      const t=i/12, u=1-t;
      let x=u*u*x1+2*u*t*qx+t*t*x2, y=u*u*y1+2*u*t*qy+t*t*y2;
      if(i>0&&i<12){ x+=(r()-.5)*2.2; y+=(r()-.5)*2.2; }
      pts.push([x,y]);
    }
    const a=pts[12], b=pts[10], ang=Math.atan2(a[1]-b[1],a[0]-b[0]);
    const tips=[-1,1].map(s=>{
      const t=ang+Math.PI+s*.45+(r()-.5)*.12;
      return `M${f(a[0])} ${f(a[1])} L${f(a[0]+Math.cos(t)*head)} ${f(a[1]+Math.sin(t)*head)}`;
    }).join(" ");
    return smooth(pts)+" "+tips;
  }
  /* any polyline, jittered at its inner points */
  function line(pts,amp,r){
    return smooth(pts.map((p,i)=>i&&i<pts.length-1?[p[0]+(r()-.5)*amp*2,p[1]+(r()-.5)*amp*2]:p));
  }
  /* an underline that drifts a little, as a hand does across a phrase */
  function underline(x1,x2,y,r){
    const n=Math.max(3,Math.round((x2-x1)/36)), pts=[], drift=(r()-.5)*3;
    for(let i=0;i<=n;i++) pts.push([x1+(x2-x1)*i/n, y+drift*i/n+(i&&i<n?(r()-.5)*2.2:0)]);
    return smooth(pts);
  }
  return {rng,smooth,loop,arrow,line,underline};
})();
