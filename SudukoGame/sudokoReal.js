drawBoard = function(){    
    var sudoku_board = $('<div></div>').addClass('sudoku_board');    
    $('#'+ this.id).empty();
    
    var puzzle = 1 //get from file
    var answer = 1 //get from json
    //draw board 
    for (i=0; i < 9; i++) {
        for (j=0; j < 9; j++) {
            position       = { x: i+1, y: j+1 };
            group_position = { x: Math.floor((position.x -1)/this.n), y: Math.floor((position.y-1)/this.n) };
            
            var value = (puzzle[index] > 0 ? puzzle[index] : ''),
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
