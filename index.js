
const ME = 1
const OPP = 0
const NONE = -1

var inputs = readline().split(' ');
const width = parseInt(inputs[0]);
const height = parseInt(inputs[1]);

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

    var inputs = readline().split(' ');
    const myMatter = parseInt(inputs[0]);
    const oppMatter = parseInt(inputs[1]);
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
            }

            tiles.push(tile)

            if (tile.owner == ME) {
                myTiles.push(tile)
                if (tile.units > 0) {
                    myUnits.push(tile)
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
    const numberOfRobotToBuildThisTurn = Math.floor(myMatter/10);
    const tileToSpawnOn = [];
    const tileToBuildOn = [];
    const tileSpawned = [];
    for (const tile of myTiles) {        
        if (tile.canSpawn && shouldSpawn(tile, tiles, myMatter)) {            
            tileToSpawnOn.push(tile);
        }
        if (tile.canBuild) {
            if (haveBuildOpportunity(tile, tiles, myMatter)) {
                tileToBuildOn.push(tile);                
            }
        }
    }


    let amount = 0;
    if(numberOfRobotToBuildThisTurn % tileToSpawnOn.length > 1) {
        amount = Math.floor(numberOfRobotToBuildThisTurn/tileToSpawnOn.length);
    } else {
        amount = 1;
    }     
    for (const tile of tileToSpawnOn) {
        if(amount) {
            tileSpawned.push(tile);
            actions.push(`SPAWN ${amount} ${tile.x} ${tile.y}`);
        }
    }
    for (const tile of tileToBuildOn) {
        // if(tileSpawned.find(t => t.x == tile.x && t.y == tile.y)) {
            actions.push(`BUILD ${tile.x} ${tile.y}`)
        // }
    }
    
    for (const tile of myUnits) {
        let target = getTargetTile(tile, tiles, true);
        if(!target) {
            let index = 0;
            oppTiles.forEach(oppTile => {
                if(oppTile.units == 0) {
                    index++;
                }
            });
            target = oppTiles[index];
        }    
        //TODO: pick a destination
        if (target) {
            const amount = tile.units;//Math.floor(tile.units/2) + 1 //TODO: pick amount of units to move
            actions.push(`MOVE ${amount} ${tile.x} ${tile.y} ${target.x} ${target.y}`)
        }
    }

    console.log(actions.length > 0 ? actions.join(';') : 'WAIT');
}

function getTargetTile(currentTile, tiles, withNeutral) {
    const upperIndex = getTileIndex(tiles, currentTile) - width;    
    const upperTile = getTile(upperIndex, tiles);

    const rightIndex = getTileIndex(tiles, currentTile) + 1;
    const rightTile = getHorizotaleTile(rightIndex, tiles, currentTile);

    const leftIndex = getTileIndex(tiles, currentTile) - 1;
    const leftTile = getHorizotaleTile(leftIndex, tiles, currentTile);

    const bottomIndex = getTileIndex(tiles, currentTile) + width;    
    const bottomTile = getTile(bottomIndex, tiles);;

    if(withNeutral === true) {
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
    return null;
}

function hasNeutral(tile) {
    return tile != null && tile.owner < 0 && tile.scrapAmount > 0
}

function hasOpponent(tile) {
    return tile != null && tile.owner == 0 && tile.scrapAmount > 0;
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
    return target != null && target.inRangeOfRecycler == 0 && target.scrapAmount > 2 || myMatter == 10;
}

function shouldSpawn(currentTile, tiles, myMatter) {
    const target = getTargetTile(currentTile, tiles, true);
    return target != null;
}

function getTileIndex(tiles, currentTile) {
    return tiles.findIndex(tile => tile.x == currentTile.x && tile.y == currentTile.y);
}
