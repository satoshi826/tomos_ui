export const plane = () => {

  const pos = [
    -1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0
  ]

  const nor = [
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0
  ]

  const st = [
    0.0, 1.0,
    1.0, 1.0,
    0.0, 0.0,
    1.0, 0.0
  ]

  const index = [
    2, 1, 0,
    1, 2, 3
  ]

  return {
    id          : 'plane',
    position    : pos,
    normal      : nor,
    textureCoord: st,
    index
  }
}