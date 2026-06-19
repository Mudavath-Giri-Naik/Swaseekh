const fs = require('fs');
const content = fs.readFileSync('public/smart-people.svg', 'utf8');

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
            const area = (maxX - minX) * (maxY - minY);
            allSubpaths.push({
                d: sub,
                bbox: { minX, maxX, minY, maxY },
                area
            });
        }
    });
});

allSubpaths.sort((a,b) => b.area - a.area);

allSubpaths.forEach((s, i) => {
    console.log(`Subpath ${i}: Area=${Math.round(s.area)}, X=[${s.bbox.minX.toFixed(1)}, ${s.bbox.maxX.toFixed(1)}], Y=[${s.bbox.minY.toFixed(1)}, ${s.bbox.maxY.toFixed(1)}]`);
});
