export const samples = [
  { x: 58, y: 70, group: 'A' }, { x: 99, y: 46, group: 'A' },
  { x: 140, y: 82, group: 'A' }, { x: 78, y: 119, group: 'A' },
  { x: 127, y: 141, group: 'A' }, { x: 177, y: 111, group: 'A' },
  { x: 49, y: 164, group: 'A' }, { x: 162, y: 46, group: 'A' },
  { x: 236, y: 132, group: 'B' }, { x: 280, y: 97, group: 'B' },
  { x: 315, y: 141, group: 'B' }, { x: 264, y: 186, group: 'B' },
  { x: 216, y: 199, group: 'B' }, { x: 321, y: 207, group: 'B' },
  { x: 352, y: 170, group: 'B' }, { x: 282, y: 237, group: 'B' },
];

export function classify(point, data = samples, k = 3) {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new TypeError('El punto debe tener coordenadas finitas.');
  }
  if (!Number.isInteger(k) || k < 1 || data.length < k) {
    throw new RangeError('k debe ser un entero entre 1 y la cantidad de ejemplos.');
  }
  const neighbors = data
    .map((sample, index) => ({ ...sample, index, distance: Math.hypot(point.x - sample.x, point.y - sample.y) }))
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .slice(0, k);
  const counts = neighbors.reduce((result, neighbor) => {
    result[neighbor.group] = (result[neighbor.group] ?? 0) + 1;
    return result;
  }, {});
  // En un empate, el vecino más cercano decide: resultado estable y explicable.
  const group = neighbors.reduce((winner, neighbor) => counts[neighbor.group] > counts[winner] ? neighbor.group : winner, neighbors[0].group);
  return { group, votes: counts[group], neighbors };
}

export function mountLab() {
  const graph = document.querySelector('#lab-graph');
  if (!graph) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const sampleLayer = graph.querySelector('#lab-samples');
  const lineLayer = graph.querySelector('#lab-lines');
  const query = graph.querySelector('#lab-query');
  const result = document.querySelector('#lab-result');
  const classifyButton = document.querySelector('#lab-classify');
  const positions = [{ x: 213, y: 154 }, { x: 116, y: 96 }, { x: 290, y: 170 }, { x: 186, y: 202 }, { x: 196, y: 64 }];
  let positionIndex = 0;
  let point = { ...positions[0] };

  samples.forEach((sample) => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', sample.x);
    circle.setAttribute('cy', sample.y);
    circle.setAttribute('r', '6');
    circle.setAttribute('class', `sample sample-${sample.group.toLowerCase()}`);
    sampleLayer.append(circle);
  });

  function move(next) {
    point = next;
    query.setAttribute('transform', `translate(${point.x} ${point.y})`);
    lineLayer.replaceChildren();
    result.textContent = '¿A qué grupo pertenece el punto naranja?';
    result.classList.remove('is-classified');
    classifyButton.textContent = 'Clasificar el punto';
  }

  classifyButton.addEventListener('click', () => {
    const prediction = classify(point);
    lineLayer.replaceChildren();
    prediction.neighbors.forEach((neighbor) => {
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', point.x);
      line.setAttribute('y1', point.y);
      line.setAttribute('x2', neighbor.x);
      line.setAttribute('y2', neighbor.y);
      lineLayer.append(line);
    });
    result.textContent = `Grupo ${prediction.group}: ${prediction.votes} de los 3 ejemplos más cercanos pertenecen a este grupo.`;
    result.classList.add('is-classified');
    classifyButton.textContent = 'Volver a clasificar';
  });

  document.querySelector('#lab-move').addEventListener('click', () => {
    positionIndex = (positionIndex + 1) % positions.length;
    move({ ...positions[positionIndex] });
  });

  graph.addEventListener('click', (event) => {
    const coordinate = graph.createSVGPoint();
    coordinate.x = event.clientX;
    coordinate.y = event.clientY;
    const next = coordinate.matrixTransform(graph.getScreenCTM().inverse());
    move({ x: Math.max(24, Math.min(376, next.x)), y: Math.max(24, Math.min(260, next.y)) });
  });
  move(point);
  document.querySelector('#lab-controls').hidden = false;
}
