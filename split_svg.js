const fs = require('fs');

// We need to read the ORIGINAL SVG to ensure we have the 6 paths intact.
// Assuming we already reverted or we just parse what's there (wait, the current public/smart-people.svg is modified).
// I will just use `git show HEAD~3:public/smart-people.svg` directly from Node!
const { execSync } = require('child_process');
const content = execSync('git show HEAD~3:public/smart-people.svg').toString();

const svgHeaderMatch = content.match(/<svg[^>]+>/);
const svgHeader = svgHeaderMatch ? svgHeaderMatch[0] : '<svg viewBox="0 0 151 151">';

const pathMatches = [...content.matchAll(/<path d=\"([^\"]+)\"[^>]*fill=\"([^\"]+)\"[^>]*>/g)];
if (pathMatches.length === 0) {
    // try different regex if fill is missing or different order
    console.log("Regex failed, trying simpler");
}

const originalPaths = [...content.matchAll(/d=\"([^\"]+)\"/g)].map(m => m[1]);

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

let newSvg = svgHeader + '\n';
newSvg += `<style>
  @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-2px) rotate(1deg); } }
  @keyframes floatRev { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(2px) rotate(-1deg); } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.98); } }
  path { transform-origin: center; transform-box: fill-box; }
  path.anim-0 { animation: float 6s ease-in-out infinite; }
  path.anim-1 { animation: floatRev 7s ease-in-out infinite; }
  path.anim-2 { animation: pulse 5s ease-in-out infinite; }
</style>\n`;

let floatingObjects = anchors.map(a => ({ name: a.name, paths: [] }));

originalPaths.forEach((p, pathIndex) => {
    let characterSubpaths = [];
    const subD = p.split(/(?=[Mm])/);
    
    subD.forEach(sub => {
        if(sub.trim() === '') return;
        
        const coords = [...sub.matchAll(/(-?\d+\.?\d*)/g)].map(m => parseFloat(m[0]));
        let xs=[], ys=[];
        for(let j=0; j<coords.length; j+=2) {
            if (!isNaN(coords[j]) && !isNaN(coords[j+1])) {
                xs.push(coords[j]); ys.push(coords[j+1]);
            }
        }
        
        if(xs.length > 0) {
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            
            let bestIdx = 0;
            let bestDist = Infinity;
            for (let i = 0; i < anchors.length; i++) {
                const dx = cx - anchors[i].cx;
                const dy = cy - anchors[i].cy;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = i;
                }
            }
            
            if (anchors[bestIdx].name.startsWith('Character')) {
                characterSubpaths.push(sub);
            } else {
                floatingObjects[bestIdx].paths.push(sub);
            }
        }
    });
    
    if (characterSubpaths.length > 0) {
        // Keep the character subpaths in their original path index layer
        const combinedD = characterSubpaths.join('');
        // Restore default fill-rule by omitting it
        newSvg += `  <path fill="black" d="${combinedD}"/>\n`;
    }
});

// Render the floating objects
let animIdx = 0;
floatingObjects.forEach((obj) => {
    if (obj.paths.length === 0 || obj.name.startsWith('Character')) return;
    
    const combinedD = obj.paths.join('');
    const animClass = `class="anim-${animIdx++ % 3}"`;
    // Original floating objects used default fill rule too
    newSvg += `  <path ${animClass} fill="black" d="${combinedD}"/>\n`;
});

newSvg += '</svg>';
fs.writeFileSync('public/smart-people-fixed.svg', newSvg);
console.log("Successfully rebuilt SVG layer by layer.");
