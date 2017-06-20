// create 'CommentBox' compoment
var CommentBox = React.createClass({
	getInitialState: function() {
		return {server_data: []};
	},

	// get comments data from server and show them
	// it shows up every 2 seconds
	componentDidMount: function() {
		this.loadCommentsFromServer();
		setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},

	// get comments data from server
	loadCommentsFromServer: function() {
		$.ajax({
			url: this.props.url,	// comments.json
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({server_data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},

	//submit to the server and refresh the list
	handleCommentSubmit: function(comment) {
		var comments = this.state.server_data;
		var newComments = comments.concat([comment]);
		this.setState({server_data: newComments});

		$.ajax({
			url: "./update_comments.php",
			dataType: 'json',
			type: 'POST',
			data: comment,
			success: function(data) {
				this.setState({server_data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},

	render: function() {
		return (
			<div className="CommentBox">
				<h1>Comments</h1>
				<CommentList comment_data={this.state.server_data}/>
				<CommentForm onCommentSubmit={this.handleCommentSubmit} />
			</div>
		);
	}
});

// create 'CommentList' component
var CommentList = React.createClass({
	render: function() {
		var commentNodes = this.props.comment_data.map(function(comment) {
			return (
				<Comment author={comment.author}>{comment.text}</Comment>
			);
		});

		return (
			<div className="commentList">
				{commentNodes}
			</div>
		);
	}
});

// create 'CommentForm' component
var CommentForm = React.createClass({
	handleSubmit: function(e) {
		e.preventDefault();

		var author = React.findDOMNode(this.refs.author).value.trim();
		var text = React.findDOMNode(this.refs.text).value.trim();

		if(!author || !text) {
			return;
		}

		// send request to the server
		this.props.onCommentSubmit({author: author, text: text});

		React.findDOMNode(this.refs.author).value = "";
		React.findDOMNode(this.refs.text).value = "";

		return;
	},

	render: function() {
		return (
			<form className="commentForm" onSubmit={this.handleSubmit}>
				<input type="text" placeholder="Your name" ref="author" />
				<input type="text" placeholder="Say something..." ref="text" />
				<input type="submit" value="Post" />
			</form>
		)
	}
});

// create 'Comment' component
var Comment = React.createClass({
	render: function() {
		var rawMarkup = marked(this.props.children.toString(), {sanitize: true});

		return (
			<div className="comment">
				<h2 className="commentAuthor">
					{this.props.author}
				</h2>
				<span dangerouslySetInnerHTML={{__html: rawMarkup}}/>
			</div>
		);
	}
});

// React.render
React.render(
	<CommentBox url="comments.json" pollInterval={2000} />,
	document.getElementById("content")
);