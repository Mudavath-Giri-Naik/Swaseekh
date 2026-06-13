cd "e:/Swaseekh-main/Swaseekh-main"
for i in $(seq 1 80); do
  node scripts/collect-formulas.js >/dev/null 2>&1
  node scripts/import-all.js > scripts/data/last-import.log 2>&1
  total=$(node -e "const{connect,mongoose}=require('./scripts/db');(async()=>{await connect();console.log(await mongoose.connection.db.collection('questions').countDocuments());await mongoose.disconnect();})()" 2>/dev/null)
  n=$(ls scripts/data/auto/*.json 2>/dev/null | wc -l)
  echo "iter $i: $n/349 files, DB total=$total"
  if [ "$n" -ge 349 ]; then echo "ALL-349-FILES-PRESENT"; break; fi
  sleep 75
done
