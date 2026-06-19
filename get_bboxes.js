const fs = require('fs');
const content = fs.readFileSync('public/smart-people.svg', 'utf8');
const paths = [...content.matchAll(/<path d=\"([^\"]+)\"[^>]*>/g)].map(m => m[1]);

paths.forEach((p, i) => {
    const coords = [...p.matchAll(/(-?\d+\.?\d*)/g)].map(m => parseFloat(m[0]));
    let xs=[], ys=[];
    for(let j=0; j<coords.length; j+=2) {
        if (!isNaN(coords[j]) && !isNaN(coords[j+1])) {
            xs.push(coords[j]); 
            ys.push(coords[j+1]);
        }
    }
    if(xs.length > 0) {
        console.log(`Path ${i+1}: X[${Math.min(...xs).toFixed(1)}, ${Math.max(...xs).toFixed(1)}], Y[${Math.min(...ys).toFixed(1)}, ${Math.max(...ys).toFixed(1)}]`);
    } else {
        console.log(`Path ${i+1}: No coords`);
    }
});
