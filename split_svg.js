const fs = require('fs');

const content = fs.readFileSync('public/smart-people.svg', 'utf8');
const svgHeaderMatch = content.match(/<svg[^>]+>/);
const svgHeader = svgHeaderMatch ? svgHeaderMatch[0] : '<svg viewBox="0 0 151 151">';

let allSubpaths = [];
const pathMatches = [...content.matchAll(/<path d=\"([^\"]+)\"[^>]*>/g)];

pathMatches.forEach((match) => {
    const subD = match[1].split(/(?=[Mm])/);
    subD.forEach(sub => {
        if(sub.trim() === '') return;
        
        const coords = [...sub.matchAll(/(-?\d+\.?\d*)/g)].map(m => parseFloat(m[0]));
        let xs=[], ys=[];
        for(let j=0; j<coords.length; j+=2) {
            if (!isNaN(coords[j]) && !isNaN(coords[j+1])) {
                xs.push(coords[j]); 
                ys.push(coords[j+1]);
            }
        }
        
        if(xs.length > 0) {
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            const area = (maxX - minX) * (maxY - minY);
            allSubpaths.push({
                d: sub,
                area: area
            });
        }
    });
});

let newSvg = svgHeader + '\n';
newSvg += `<style>
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
  @keyframes floatRev { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(8px); } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.9); } }
  g.anim-0 { animation: float 5s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
  g.anim-1 { animation: floatRev 4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
  g.anim-2 { animation: pulse 3s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
</style>\n`;

const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#9D71FD', '#F26419', '#FF9F1C', '#2EC4B6'];
let colorIdx = 0;

allSubpaths.forEach((sub, idx) => {
    // Subpaths with very large areas are the character and outlines.
    // The viewBox is 151x151, so total area is ~22500.
    // The book is around 40x40 = 1600.
    // Lightbulb is around 30x30 = 900.
    // Let's say if area > 3500, it's the main character/outline (black, static).
    // If area <= 3500, it's a floating object (colored, animated).
    
    // Also, tiny paths (area < 50) might be facial features inside the main character!
    // We shouldn't colorize or animate them if they are facial features.
    // But how to tell? We'll just assume very small paths are also black and static.
    
    let isMain = sub.area > 2000 || sub.area < 100;
    
    const color = isMain ? 'black' : colors[colorIdx++ % colors.length];
    const animClass = isMain ? '' : `class="anim-${idx % 3}"`;
    
    newSvg += `<g ${animClass} fill="${color}">\n`;
    newSvg += `  <path d="${sub.d}"/>\n`;
    newSvg += `</g>\n`;
});

newSvg += '</svg>';

fs.writeFileSync('public/smart-people-fixed.svg', newSvg);
console.log(`Generated smart-people-fixed.svg with ${allSubpaths.length} subpaths.`);
