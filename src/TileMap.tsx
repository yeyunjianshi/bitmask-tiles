import { FC, useRef } from 'react'
import style from './TileMap.module.css'
import useUpdate from './hooks/useUpdate'
import TileValueToSpriteIndex from './TileValueToSpriteIndex'

enum Direction {
  WEST_NORTH = 0b00000001,
  NORTH = 0b00000010,
  EAST_NORTH = 0b00000100,
  WEST = 0b00001000,
  EAST = 0b00010000,
  WEST_SOUTH = 0b00100000,
  SOUTH = 0b01000000,
  EAST_SOUTH = 0b10000000,
}

const MAP_WIDTH = 15
const MAP_HEIGHT = 15

function mapIndexToRowAndColumn(
  index: number,
  width = MAP_WIDTH
): [number, number] {
  return [index % width, Math.floor(index / width)]
}

function rowAndColumnToIndex(
  row: number,
  column: number,
  width = MAP_WIDTH
): number {
  return column * width + row
}

function tileMapValue(mapData: number[], row: number, column: number): number {
  if (row < 0 || row >= MAP_HEIGHT || column < 0 || column >= MAP_WIDTH)
    return 0
  return mapData[rowAndColumnToIndex(row, column)]
}

function tileRuleSpriteOffset(
  mapData: number[],
  mapIndex: number
): [number, number] {
  const [row, column] = mapIndexToRowAndColumn(mapIndex)
  const northValue = tileMapValue(mapData, row, column - 1)
  const southValue = tileMapValue(mapData, row, column + 1)
  const eastValue = tileMapValue(mapData, row + 1, column)
  const westValue = tileMapValue(mapData, row - 1, column)
  const eastNorthValue =
    eastValue && northValue && tileMapValue(mapData, row + 1, column - 1)
  const westNorthValue =
    westValue && northValue && tileMapValue(mapData, row - 1, column - 1)
  const eastSouthValue =
    eastValue && southValue && tileMapValue(mapData, row + 1, column + 1)
  const westSouthValue =
    westValue && southValue && tileMapValue(mapData, row - 1, column + 1)
  const value =
    northValue * Direction.NORTH +
    southValue * Direction.SOUTH +
    eastValue * Direction.EAST +
    westValue * Direction.WEST +
    eastNorthValue * Direction.EAST_NORTH +
    westNorthValue * Direction.WEST_NORTH +
    eastSouthValue * Direction.EAST_SOUTH +
    westSouthValue * Direction.WEST_SOUTH

  const sprinteOffsetIndex = TileValueToSpriteIndex.get(value) || 0
  return mapIndexToRowAndColumn(sprinteOffsetIndex, 8)
}

type Props = {
  width?: number
  height?: number
}

const TileMap: FC<Props> = ({ width = MAP_WIDTH, height = MAP_HEIGHT }) => {
  const tileDataRef = useRef(Array.from({ length: width * height }, () => 1))
  const forceUpdateHandler = useUpdate()

  const clickHandler = (index: number, val: number) => {
    tileDataRef.current[index] = val ? 0 : 1
    forceUpdateHandler()
  }

  return (
    <ul className={style.container}>
      {tileDataRef.current.map((v, i) => {
        const [offsetX, offsetY] = tileRuleSpriteOffset(tileDataRef.current, i)
        return (
          <li
            className={!v ? style.hidden : undefined}
            onClick={() => clickHandler(i, v)}
            key={i}
            style={{
              backgroundPosition: `-${offsetX * 48}px -${offsetY * 48}px`,
            }}
          ></li>
        )
      })}
    </ul>
  )
}

export default TileMap
