const fs = require('fs');
const content = fs.readFileSync('public/smart-people.svg', 'utf8');
const paths = [...content.matchAll(/d=\"([^\"]+)\"/g)].map(m => m[1]);

paths.forEach((p, i) => {
    // Split by M or m
    const subpaths = p.split(/(?=[Mm])/);
    console.log(`Path ${i+1} has ${subpaths.length} subpaths`);
});
