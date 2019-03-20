class Sudoku {
  constructor(matrix) {
    if (!matrix) return new Error('Argument matrix is requared')

    this.matrix = matrix
    this.possibleMatrix = this.getPossibleMatrix()
  }

  getMatrix() {
    return this.matrix
  }

  getPossibleMatrix() {
    let possibleMatrix = [[],[],[],[],[],[],[],[],[]]

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        possibleMatrix[y][x] = this.getPossibleDigits(y, x)
      }
    }
  
    return possibleMatrix;
  }
  
  getPossibleDigits(y, x) {
    if (this.matrix[y][x] !== 0) return []

    let knowns = this.getDigits(y, x)
  
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter( item => !knowns.includes(item) )
  }

  getDigits(y, x) {    
    let knowns = []

    for (let i = 0; i < 9; i++) {
      let shiftY = Math.floor(y / 3) * 3 + i % 3
      let shiftX = Math.floor(x / 3) * 3 + Math.floor(i / 3)
  
      knowns.push(this.matrix[y][i], this.matrix[i][x], this.matrix[shiftY][shiftX])
    }

    return knowns;
  }
  
  checkPossibleSingleDigits(y, x) {
    if (this.possibleMatrix[y][x].length < 2) return

    for (let i=0; i < this.possibleMatrix[y][x].length; i++) {
      let item = this.possibleMatrix[y][x][i]
      let isSingleInRow = true
      let isSingleInColumn = true
      let isSingleInBlock = true

      for (let j=0; j < 9; j++) {
        let shiftY = Math.floor(y / 3) * 3 + j % 3
        let shiftX = Math.floor(x / 3) * 3 + Math.floor(j / 3)

        if (j !== y && this.possibleMatrix[j][x].includes(item))
          isSingleInColumn = false
        
        if (j !== x && this.possibleMatrix[y][j].includes(item)) 
          isSingleInRow = false

        if ((shiftY !== y || shiftX !== x) && this.possibleMatrix[shiftY][shiftX].includes(item)) 
          isSingleInBlock = false
      }

      if (isSingleInRow || isSingleInColumn || isSingleInBlock) {
        this.possibleMatrix[y][x] = [item]
        return
      }
    }
  }
  
  hasRowDigit(y, item) {
    return this.matrix[y].includes(item)
  }
  
  hasColumnDigit(x, item) {
    return this.matrix.map(row => row[x]).includes(item)
  }

  checkHiddenSingleDigits(y, x) {
    if (this.possibleMatrix[y][x].length < 2) return

    let block =  [[0,0,0],[0,0,0],[0,0,0]]

    for (let i = 0; i < 9; i++) {
      let shiftY = Math.floor(y / 3) * 3 + i % 3
      let shiftX = Math.floor(x / 3) * 3 + Math.floor(i / 3)

      block[shiftY % 3][shiftX % 3] = this.matrix[shiftY][shiftX] > 0 ? 1 : 0
    }

    for (let i=0; i < this.possibleMatrix[y][x].length; i++) {
      let item = this.possibleMatrix[y][x][i]
      let fillBlock = block.map(r => r.map(c => c))

      for (let j=1; j <= 2; j++) {
        let shiftY = Math.floor(y / 3) * 3 + (y + j) % 3
        let shiftX = Math.floor(x / 3) * 3 + (x + j) % 3

        if (this.hasRowDigit(shiftY, item))
          fillBlock[shiftY % 3] = [1,1,1]

        if (this.hasColumnDigit(shiftX, item))
          for (let m=0; m < 3; m++) fillBlock[m][shiftX % 3] = 1
      }

      let count = fillBlock.map(r => r.filter(c => c === 0).length).reduce((acc, item) => acc + item)
      if (count === 1) {
        this.possibleMatrix[y][x] = [item]
        return
      }
    }
  }

  tryFixSingleDigit(y, x) {
    if (this.possibleMatrix[y][x].length !== 1) return
  
    let digit = this.possibleMatrix[y][x].shift()
    this.matrix[y][x] = digit

    for (let i = 0; i < 9; i++) {
      let shiftY = Math.floor(y / 3) * 3 + i % 3
      let shiftX = Math.floor(x / 3) * 3 + Math.floor(i / 3)
  
      this.removeMatchDigit(y, i, digit)
      this.removeMatchDigit(i, x, digit)
      this.removeMatchDigit(shiftY, shiftX, digit)
    }
  }

  removeMatchDigit(y, x, digit) {
    let index = this.possibleMatrix[y][x].indexOf(digit)
    if (index !== -1) {
      this.possibleMatrix[y][x].splice(index, 1)
      this.tryFixSingleDigit(y, x)
    }
  }

  pickDigits() {
    for (let y=0; y < 9; y++) {
      for (let x=0; x < 9; x++) {
        if (this.matrix[y][x] === 0) {
          let possibleDigits = this.getPossibleDigits(y, x)
          for (let i=0; i < possibleDigits.length; i++) {
            this.matrix[y][x] = possibleDigits[i]
            if(this.pickDigits()) return true
          }
          this.matrix[y][x] = 0
          return false
        }
      }
    }
    return true
  }

  solve() {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        this.checkHiddenSingleDigits(y, x)
        this.checkPossibleSingleDigits(y, x)
        this.tryFixSingleDigit(y, x)
      }
    }
    this.pickDigits(this.matrix)
    return this.matrix
  }
}

module.exports = function solveSudoku(matrix) {
  // your solution
  let sudoku = new Sudoku(matrix)
  sudoku.solve()
  return sudoku.getMatrix()
}