const fs = require('fs');

const content = fs.readFileSync('public/smart-people.svg', 'utf8');
const svgHeaderMatch = content.match(/<svg[^>]+>/);
const svgHeader = svgHeaderMatch ? svgHeaderMatch[0] : '<svg viewBox="0 0 151 151">';

let allSubpaths = [];
const pathMatches = [...content.matchAll(/d=\"([^\"]+)\"/g)];

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
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            allSubpaths.push({
                d: sub, cx, cy
            });
        }
    });
});

const anchors = [
    { name: 'Character_Body', cx: 75, cy: 70 },
    { name: 'Character_Shoe', cx: 57, cy: 110 },
    { name: 'Character_Face', cx: 77, cy: 50 },
    { name: 'Character_Chest', cx: 65, cy: 60 },
    { name: 'Character_Arm', cx: 89, cy: 65 },
    { name: 'Lightbulb', cx: 100, cy: 17 },
    { name: 'Laptop', cx: 24, cy: 77 },
    { name: 'Gear', cx: 27, cy: 128 },
    { name: 'Lightning', cx: 131, cy: 64 },
    { name: 'Notebook', cx: 107, cy: 110 },
    { name: 'SquiggleTL', cx: 38, cy: 36 },
    { name: 'SquiggleBR', cx: 83, cy: 140 },
    { name: 'PlusL', cx: 22, cy: 87 },
    { name: 'PlusTR', cx: 135, cy: 28 },
    { name: 'DotBL', cx: 14, cy: 50 },
    { name: 'SquiggleBL', cx: 43, cy: 128 },
    { name: 'PencilTip', cx: 133, cy: 86 }
];

let clusters = anchors.map(a => ({ name: a.name, cx: a.cx, cy: a.cy, paths: [] }));

allSubpaths.forEach((sub) => {
    let bestIdx = 0;
    let bestDist = Infinity;
    
    for (let i = 0; i < anchors.length; i++) {
        const dx = sub.cx - anchors[i].cx;
        const dy = sub.cy - anchors[i].cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
        }
    }
    
    clusters[bestIdx].paths.push(sub);
});

let newSvg = svgHeader + '\n';
newSvg += `<style>
  @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-3px) rotate(1deg); } }
  @keyframes floatRev { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(3px) rotate(-1deg); } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.98); } }
  path { transform-origin: center; transform-box: fill-box; }
  path.anim-0 { animation: float 6s ease-in-out infinite; }
  path.anim-1 { animation: floatRev 7s ease-in-out infinite; }
  path.anim-2 { animation: pulse 5s ease-in-out infinite; }
</style>\n`;

let colorIdx = 0;
let characterD = '';

clusters.forEach((cluster) => {
    if (cluster.paths.length === 0) return;
    
    if (cluster.name.startsWith('Character')) {
        characterD += cluster.paths.map(sub => sub.d).join('');
    } else {
        const animClass = `class="anim-${colorIdx++ % 3}"`;
        const combinedD = cluster.paths.map(sub => sub.d).join('');
        // Render floating items completely black as requested
        newSvg += `  <path ${animClass} fill="black" d="${combinedD}"/>\n`;
    }
});

// Render the single unified character path.
if (characterD) {
    newSvg += `  <path fill="black" d="${characterD}"/>\n`;
}

newSvg += '</svg>';
fs.writeFileSync('public/smart-people-fixed.svg', newSvg);
