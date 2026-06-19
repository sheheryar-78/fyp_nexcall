export const chunkText = (text, maxChunkSize = 1000) => {
  if (!text) return [];
  
  // Split by paragraphs or sentence endings
  const segments = text.split(/(?<=\n\n)|(?<=[.?!])\s+/);
  
  const chunks = [];
  let currentChunk = "";

  for (let segment of segments) {
    segment = segment.trim();
    if (!segment) continue;

    if (currentChunk.length + segment.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = segment;
    } else {
      currentChunk += (currentChunk ? " " : "") + segment;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  // Fallback if no chunks were created
  return chunks.length > 0 ? chunks : [text.substring(0, maxChunkSize)];
};