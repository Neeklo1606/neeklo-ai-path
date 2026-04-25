export type KnowledgeNode = {
  id: string;
  x: number;
  y: number;
  size: number;
  label: string;
};

export type KnowledgeEdge = {
  id: string;
  from: string;
  to: string;
};

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

export function buildKnowledgeGraph(pointCount: number, seed = "kb"): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const rand = seeded(seed);
  const outerNodes = Math.max(1, Math.min(60, Math.floor(Math.max(1, pointCount))));
  const center: KnowledgeNode = { id: "core", x: 0, y: 0, size: 10, label: "Knowledge Core" };

  const nodes: KnowledgeNode[] = [center];
  const edges: KnowledgeEdge[] = [];

  for (let i = 0; i < outerNodes; i += 1) {
    const angle = (Math.PI * 2 * i) / outerNodes + rand() * 0.25;
    const radius = 44 + rand() * 32;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const node: KnowledgeNode = {
      id: `n${i}`,
      x,
      y,
      size: 2 + Math.floor(rand() * 3),
      label: `chunk ${i + 1}`,
    };
    nodes.push(node);
    edges.push({ id: `e-core-${i}`, from: "core", to: node.id });
  }

  for (let i = 1; i < nodes.length - 1; i += 1) {
    if (rand() > 0.55) {
      edges.push({ id: `e-${i}-${i + 1}`, from: nodes[i].id, to: nodes[i + 1].id });
    }
  }
  return { nodes, edges };
}
