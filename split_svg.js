const fs = require('fs');

const content = fs.readFileSync('public/smart-people.svg', 'utf8');
const svgHeaderMatch = content.match(/<svg[^>]+>/);
const svgHeader = svgHeaderMatch ? svgHeaderMatch[0] : '<svg viewBox="0 0 151 151">';

// Extract all subpaths
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
            allSubpaths.push({
                d: sub,
                bbox: { minX, maxX, minY, maxY }
            });
        }
    });
});

function isInside(b1, b2) {
    return (b1.minX >= b2.minX && b1.maxX <= b2.maxX && 
            b1.minY >= b2.minY && b1.maxY <= b2.maxY);
}

let clusters = [];
allSubpaths.forEach((subpath) => {
    let touchingClusterIndices = new Set();
    
    for (let i = 0; i < clusters.length; i++) {
        for (let j = 0; j < clusters[i].length; j++) {
            if (isInside(subpath.bbox, clusters[i][j].bbox) || isInside(clusters[i][j].bbox, subpath.bbox)) {
                touchingClusterIndices.add(i);
                break;
            }
        }
    }
    
    let touchingArr = Array.from(touchingClusterIndices);
    
    if (touchingArr.length === 0) {
        clusters.push([subpath]);
    } else if (touchingArr.length === 1) {
        clusters[touchingArr[0]].push(subpath);
    } else {
        let mergedCluster = [subpath];
        touchingArr.sort((a,b)=>b-a).forEach(cIdx => {
            mergedCluster = mergedCluster.concat(clusters[cIdx]);
            clusters.splice(cIdx, 1);
        });
        clusters.push(mergedCluster);
    }
});

let newSvg = svgHeader + '\n';
newSvg += `<style>
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
  @keyframes floatRev { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(5px); } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.95); } }
  path.anim-0 { animation: float 4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
  path.anim-1 { animation: floatRev 5s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
  path.anim-2 { animation: pulse 3s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
</style>\n`;

clusters.sort((a,b) => b.length - a.length);

const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#9D71FD', '#F26419', '#FF9F1C', '#2EC4B6'];
let colorIdx = 0;

clusters.forEach((cluster, idx) => {
    let minX = Math.min(...cluster.map(c => c.bbox.minX));
    let maxX = Math.max(...cluster.map(c => c.bbox.maxX));
    let minY = Math.min(...cluster.map(c => c.bbox.minY));
    let maxY = Math.max(...cluster.map(c => c.bbox.maxY));
    let area = (maxX - minX) * (maxY - minY);
    
    // Main character outlines are huge. Book is ~1500. So anything > 3500 is character outline.
    // Also tiny facial details (area < 100) should be black.
    const isMainCharacter = area > 3500 || area < 100; 
    
    const color = isMainCharacter ? 'black' : colors[colorIdx++ % colors.length];
    const animClass = isMainCharacter ? '' : `class="anim-${idx % 3}"`;
    
    const combinedD = cluster.map(sub => sub.d).join('');
    newSvg += `  <path ${animClass} fill="${color}" d="${combinedD}" fill-rule="evenodd" clip-rule="evenodd"/>\n`;
});

newSvg += '</svg>';

fs.writeFileSync('public/smart-people-fixed.svg', newSvg);
console.log(`Successfully split into ${clusters.length} distinct elements/clusters.`);
