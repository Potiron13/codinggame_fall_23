
const ME = 1
const OPP = 0
const NONE = -1

var inputs = readline().split(' ');
const width = parseInt(inputs[0]);
const height = parseInt(inputs[1]);
let turnCount = 0;
let isLeftSideOfMap = false;
let isTopSideOfMap = false;

// game loop
while (true) {
    const tiles = []
    const myUnits = []
    const oppUnits = []
    const myRecyclers = []
    const oppRecyclers = []
    const oppTiles = []
    const myTiles = []
    const neutralTiles = []

    turnCount++;

    var inputs = readline().split(' ');
    const myMatter = parseInt(inputs[0]);
    const oppMatter = parseInt(inputs[1]);
    let index = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            var inputs = readline().split(' ');
            const scrapAmount = parseInt(inputs[0]);
            const owner = parseInt(inputs[1]); // 1 = me, 0 = foe, -1 = neutral
            const units = parseInt(inputs[2]);
            const recycler = inputs[3] == '1';
            const canBuild = inputs[4] == '1';
            const canSpawn = inputs[5] == '1';
            const inRangeOfRecycler = inputs[6] == '1';
            const tile = {
                x,
                y,
                scrapAmount,
                owner,
                units,
                recycler,
                canBuild,
                canSpawn,
                inRangeOfRecycler,
                hasOpp: false,
                index,
                neighborTiles: []
            }

            tiles.push(tile)

            if (tile.owner == ME) {
                myTiles.push(tile)
                if (tile.units > 0) {
                    myUnits.push(tile);
                    if(turnCount <= 1) {
                        isLeftSideOfMap = tile.x < Math.floor(width/2);
                        isTopSideOfMap = tile.y < Math.floor(height/2);
                    }
                    index++;
                } else if (tile.recycler) {
                    myRecyclers.push(tile)
                }
            } else if (tile.owner == OPP) {
                oppTiles.push(tile)
                if (tile.units > 0) {
                    oppUnits.push(tile)
                } else if (tile.recycler) {
                    oppRecyclers.push(tile)
                }
            } else {
                neutralTiles.push(tile)
            }
        }
    }

    const actions = []
    actions.push(`MESSAGE COUCOU LAALA`);
    const numberOfRobotToBuildThisTurn = Math.floor(myMatter/10);
    const tileToBuildOn = [];
    let tileToSpawnOn = [];
    for (const tile of myTiles) {
        if (tile.canSpawn && shouldSpawn(tile, tiles, myMatter)) {
            tileToSpawnOn.push(tile);
        }
        if (tile.canBuild) {
            if(turnCount === 1) {
                actions.push(`BUILD ${tile.x} ${tile.y}`)
            }
            if (haveBuildOpportunity(tile, tiles, myMatter)) {
                tileToBuildOn.push(tile);
            }
        }
    }

    if(turnCount % 2 == 0) {
        if(isLeftSideOfMap) {
            tileToSpawnOn.sort((tileA, tileB) =>  tileB.x - tileA.x);
        } else {
            tileToSpawnOn.sort((tileA, tileB) =>  tileA.x - tileB.x);
        }
    } else {
        if(isTopSideOfMap) {
            tileToSpawnOn.sort((tileA, tileB) =>  tileB.y - tileA.y);
        } else {
            tileToSpawnOn.sort((tileA, tileB) =>  tileA.y - tileB.y);
        }
    }
    const filteredTiles = tileToSpawnOn.filter(tile => tile.hasOpp === true);
    tileToSpawnOn = filteredTiles.length <= 2 && filteredTiles.length > 0 ? filteredTiles : tileToSpawnOn;
    let amount = 0;
    if(tileToSpawnOn.length > 0 && Math.floor(numberOfRobotToBuildThisTurn/tileToSpawnOn.length) >0) {
        amount = Math.floor(numberOfRobotToBuildThisTurn/tileToSpawnOn.length);
    } else {
        amount = 1;
    }
    for (const tile of tileToSpawnOn) {
        if(amount) {
            actions.push(`SPAWN ${amount} ${tile.x} ${tile.y}`);
        }
    }
    for (const tile of tileToBuildOn) {
        actions.push(`BUILD ${tile.x} ${tile.y}`)
    }

    for (const tile of myUnits) {
        let target = getTargetTile(tile, tiles, true, myUnits);
        if(!target) {
            let index = 0;
            oppTiles.forEach(oppTile => {
                if(oppTile.units == 0) {
                    index++;
                }
            });
            target = oppTiles[index];
        }

        actions.push(`MOVE ${amount} ${tile.x} ${tile.y} ${target.x} ${target.y}`)

        // let unitCount = tile.units;
        // while(unitCount > 0) {
        //     actions.push(`MESSAGE ${unitCount}`)
        //     if(unitCount != tile.units && tile.neighborTiles.length > 0) {
        //         target = tile.neighborTiles.find(n => n.x != target.x && n.y != target.y);
        //     }
        //     if (target) {
        //         const amount = Math.floor(tile.units/2) + 1 //tile.units; //TODO: pick amount of units to move
        //         unitCount -= amount;
        //         actions.push(`MOVE ${amount} ${tile.x} ${tile.y} ${target.x} ${target.y}`)
        //     } else {
        //         unitCount = 0;
        //     }
        // }
    }

    console.log(actions.length > 0 ? actions.join(';') : 'WAIT');
}

function getTargetTile(currentTile, tiles, withNeutral, myUnits) {
    const opponentList = [];
    const neutralList = [];
    const currentTileIndex = getTileIndex(tiles, currentTile);
    const upperIndex = currentTileIndex - width;
    const upperTile = getTile(upperIndex, tiles);

    const rightIndex = currentTileIndex + 1;
    const rightTile = getHorizotaleTile(rightIndex, tiles, currentTile);

    const leftIndex = currentTileIndex - 1;
    const leftTile = getHorizotaleTile(leftIndex, tiles, currentTile);

    const bottomIndex = currentTileIndex + width;
    const bottomTile = getTile(bottomIndex, tiles);

    if(upperTile) {
        opponentList.push(upperTile);
    }
    if(rightTile) {
        opponentList.push(rightTile);
    }
    if(leftTile) {
        opponentList.push(leftTile);
    }
    if(bottomTile) {
        opponentList.push(bottomTile);
    }
    if (currentTile.units > 1 && opponentList.length > 1) {
        opponentList.sort((tileA, tileB) =>  tileB.units - tileA.units);
        for (let i = 0; i < opponentList.length; i++) {
            if(hasOpponent(opponentList[i]) && currentTile.units > opponentList[i].units) {
                return opponentList[i];
            }
        }
    }
    if(currentTile.x > Math.floor(width/2)) {
        if(hasOpponent(leftTile)) {
            return leftTile;
        }
        if(hasOpponent(rightTile)) {
            return rightTile;
        }
    } else {
        if(hasOpponent(rightTile)) {
            return rightTile;
        }
        if(hasOpponent(leftTile)) {
            return leftTile;
        }
    }
    if(hasOpponent(bottomTile)) {
        return bottomTile;
    }
    if(hasOpponent(upperTile)) {
        return upperTile;
    }
    if(withNeutral === true) {
        if(upperTile) {
            neutralList.push(upperTile);
        }
        if(rightTile) {
            neutralList.push(rightTile);
        }
        if(leftTile) {
            neutralList.push(leftTile);
        }
        if(bottomTile) {
            neutralList.push(bottomTile);
        }
        currentTile.neighborTiles.push.apply(neutralList);
        if(turnCount <= Math.floor(height) && myUnits) {
            if(currentTile.index === myUnits.length - 1) {
                if(hasNeutral(bottomTile)) {
                    return bottomTile;
                }
            } else if(currentTile.index === 0) {
                if(hasNeutral(upperTile)) {
                    return upperTile;
                }
            }
        }
        if(currentTile.x > Math.floor(width/2)) {
            if(hasNeutral(leftTile)) {
                return leftTile;
            }
            if(hasNeutral(rightTile)) {
                return rightTile;
            }
        } else {
            if(hasNeutral(rightTile)) {
                return rightTile;
            }
            if(hasNeutral(leftTile)) {
                return leftTile;
            }
        }

        if(hasNeutral(bottomTile)) {
            return bottomTile;
        }
        if(hasNeutral(upperTile)) {
            return upperTile;
        }
    }
    return null;
}

function hasNeutral(tile) {
    return tile != null && tile.owner === NONE && tile.scrapAmount > 0
}

function hasOpponent(tile) {
    const result = tile != null && tile.owner == OPP && tile.scrapAmount > 0 && tile.inRangeOfRecycler == 0;
    if(result) {
        tile.hasOpp = true;
    }
    return result;
}

function getTile(index, tiles) {
    return index > 0 || index < tiles.length ? tiles[index] : null;
}

function getHorizotaleTile(index, tiles, currentTile) {
    let tile = null;
    if(index > 0 && index < tiles.length) {
        if(tiles[index].y == currentTile.y) {
            tile = tiles[index];
        }
    }
    return tile;
}

function haveBuildOpportunity(currentTile, tiles, myMatter) {
    const target = getTargetTile(currentTile, tiles, false);
    return target != null; // && target.inRangeOfRecycler == 0 && target.scrapAmount > 2;// && myMatter < 100;
}

function shouldSpawn(currentTile, tiles, myMatter) {
    const target = getTargetTile(currentTile, tiles, true);
    return target != null;
}

function getTileIndex(tiles, currentTile) {
    return tiles.findIndex(tile => tile.x == currentTile.x && tile.y == currentTile.y);
}
