var TimedQueue = function(defaultDelay){
    this.store = [];
    this.index = 0;
    this.defaultDelay = defaultDelay || 3000;
};

TimedQueue.prototype = {
    add: function(fn, delay){
        this.store.push({
            fn: fn,
            delay: delay
        });
    },
    run: function(index){
        (index || index === 0) && (this.index = index);
        this.next();
    },
    next: function(){
        var self = this
        , i = this.index++
        , at = this.store[i]
        , next = this.store[this.index]
        if(!at) return;
        at.fn();
        next && setTimeout(function(){
            self.next();
        }, next.delay || this.defaultDelay);
    },
    reset: function(){
        this.index = 0;
    }
}

module.exports = TimedQueue;