drawBoard = function(){
    var index = 0,
        position       = { x: 0, y: 0 },
        group_position = { x: 0, y: 0 };
    
    var sudoku_board = $('<div></div>').addClass('sudoku_board');    
    $('#'+ this.id).empty();
    
    var puzzle = 1 //get from file
    var answer = 1 //get from json
    //draw board 
    for (i=0; i < this.nn; i++) {
        for (j=0; j < this.nn; j++) {
            position       = { x: i+1, y: j+1 };
            group_position = { x: Math.floor((position.x -1)/this.n), y: Math.floor((position.y-1)/this.n) };
            
            var value = (puzzle[index] > 0 ? this.board[index] : ''),
                cell = $('<div></div>')
                            .addClass('cell')
                            .attr('x', position.x)
                            .attr('y', position.y)
                            .attr('gr', group_position.x +''+ group_position.y)
                            .html('<span>'+ value +'</span>' );
            cell.appendTo(sudoku_board);
            index++;
        }
    }
    
};
