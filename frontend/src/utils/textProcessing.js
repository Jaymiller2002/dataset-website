export function filterMessageThread(messageThread) {
  if (!messageThread) return '';
  const lines = messageThread.split(/\n|---/);
  const boilerplatePatterns = [
    /^[A-Z ]+RATED THEIR STAY \d STARS!?$/i,
    /to find tips and tricks from hosts around the world/i,
    /had great things to say about their stay/i,
    /read on for a snapshot/i,
    /now that you and your guest have both written reviews/i,
    /we've posted them to your airbnb profiles/i,
    /keep hosting 5-star stays/i,
    /get more 5-star reviews/i,
    /add details guests will love/i,
    /connect with other hosts/i,
    /visit the airbnb community center/i,
    /airbnb, inc\./i,
    /10 min read/i,
    /6 min read/i,
  ];
  const filtered = lines
    .map(line => line.trim())
    .filter(line =>
      line.length > 0 &&
      !boilerplatePatterns.some(pattern => pattern.test(line))
    );
  return filtered.join(' ');
}

export function processTextForWordCloud(text) {
  const stopWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'that', 'this', 'with', 'have', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'what', 'word', 'said', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'time', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part', 'review', 'stay', 'great', 'nice', 'good', 'clean', 'comfortable', 'host', 'guest', 'room', 'house', 'apartment', 'place', 'location', 'area', 'neighborhood', 'city', 'town', 'street', 'address', 'check', 'in', 'out', 'checkin', 'checkout', 'arrival', 'departure', 'booking', 'reservation', 'airbnb', 'bnb', 'hosting', 'rental', 'property', 'accommodation', 'lodging', 'hotel', 'motel', 'inn', 'suite', 'studio', 'loft', 'cottage', 'cabin', 'chalet', 'villa', 'mansion', 'castle', 'palace', 'tower', 'building', 'structure', 'facility', 'establishment', 'venue', 'site', 'spot', 'destination', 'attraction', 'landmark', 'monument', 'statue', 'fountain', 'park', 'garden', 'beach', 'mountain', 'lake', 'river', 'ocean', 'sea', 'island', 'peninsula', 'bay', 'cove', 'harbor', 'port', 'marina', 'dock', 'pier', 'wharf', 'jetty', 'breakwater', 'seawall', 'bulkhead', 'revetment', 'groyne', 'spur', 'dike', 'levee', 'dam', 'reservoir', 'pond', 'stream', 'creek', 'brook', 'rivulet', 'tributary', 'estuary', 'delta', 'mouth', 'source', 'headwaters', 'spring', 'well', 'aquifer', 'groundwater', 'surface', 'water', 'liquid', 'fluid', 'moisture', 'humidity', 'dampness', 'wetness', 'dryness', 'aridity', 'desiccation', 'dehydration', 'hydration', 'saturation', 'soaking', 'drenching', 'flooding', 'overflow', 'spill', 'leak', 'drip', 'drop', 'trickle', 'flow', 'stream', 'current', 'tide', 'wave', 'surge', 'swell', 'breaker', 'whitecap', 'foam', 'spray', 'mist', 'fog', 'vapor', 'steam', 'smoke', 'fume', 'gas', 'air', 'wind', 'breeze', 'gust', 'draft'
  ];

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !stopWords.includes(word)
    )
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
} 