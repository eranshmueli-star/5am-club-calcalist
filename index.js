import fs from 'fs';

async function run() {
  const data = {
    updatedAt: new Date().toISOString(),
    items: [
      {
        title: "Example article",
        link: "https://www.calcalist.co.il"
      }
    ]
  };

  fs.writeFileSync('calcalist.json', JSON.stringify(data, null, 2));
  console.log('Saved calcalist.json');
}

run();
