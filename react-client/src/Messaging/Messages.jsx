import React from 'react';
import $ from 'jquery';
var Promise = require('bluebird');
import MessagesList from './MessagesList.jsx';
import MessageFriendList from './MessageFriendList.jsx';
import MessageFriendSelected from './MessageFriendSelected.jsx';

class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFriend: this.props.selectedFriend || '',
      mutualFriends: [],
      messages: [],
      messageText: ''
    };
  }

  selectFriend(friend){
    this.getMutualFriends(friend.username)
    .then((friends) => {
      this.setState({
        mutualFriends: friends,
        selectedFriend: friend
      });
    });

    this.getMessageHistory(friend.username)
    .then((messages) => {
      this.addClassType(messages, friend)
      .then((messages) => {
        this.setState({
          messages: messages
        });
      })
    })
  }

  addClassType(messages, friend){
    var promise = new Promise((resolve, reject) => {
      for (var i = 0; i < messages.length; i++) {
        if (messages[i].sender === friend.username) {
          messages[i]['classType'] = 'message_left talk-bubble-left tri-right round left-in';
        } else {
          messages[i]['classType'] = 'messageRight talk-bubble-right tri-right round right-in';
        }
      }
      resolve(messages);
    });
    return promise;
  }

  getMutualFriends(friend) {
    var promise = new Promise((resolve, reject) => {
      $.ajax({
        method: 'POST',
        url: '/friends/mutual',
        data: {
          friend: friend
        },
        success: (friends) => {
          friends = JSON.parse(friends);
          resolve(friends);
        },
        error: (error) => {
          console.log('************* getMutualFriends ERROR:', error);
          reject(error);
        }
      });
    });
    return promise;
  }

//research socket io for messaging
  getMessageHistory(friend) {
    var promise = new Promise((resolve, reject) => {
      $.ajax({
        method: 'POST',
        url: '/messages/hist',
        data: {
          friend: friend
        },
        success: (messages) => {
          messages = JSON.parse(messages);
          resolve(messages);
        },
        error: (error) => {
          console.log('********** getMessageHistory ERROR:', error);
          reject(error);
        }
      });
    });
    return promise;
  }

//fix / text this on the server & db side
  addMessage() {
    var context = this;
    $.ajax({
      method: 'POST',
      url: '/messages/new',
      data: {
        friend: this.state.selectedFriend.username,
        message: this.state.messageText
      },
      success: (messages) => {
        messages = JSON.parse(messages);
        context.addClassType(messages, context.state.selectedFriend.username)
        .then((messages) => {
          context.setState({
            message: '',
            messages: messages,
            messageText: ''
          }, () => {document.getElementById('messageList').scrollTop = document.getElementById('messageList').scrollHeight});
        })
      },
      error: (error) => {
        console.log('********* add message ERROR:', error);
      }
    });
  }
  blockFriend() { //update this
    var context = this;
    $.ajax({
      method: 'POST',
      url: '/messages/new',
      data: {
        friend: this.state.selectedFriend.username,
        message: this.state.messageText
      },
      success: (messages) => {
        messages = JSON.parse(messages);
        context.addClassType(messages, context.state.selectedFriend.username)
        .then((messages) => {
          context.setState({
            message: '',
            messages: messages
          });
        })
      },
      error: (error) => {
        console.log('********* add message ERROR:', error);
      }
    });
  }

  changeMessage(e) {
    var stateInput = {};
    stateInput[e.target.id] = e.target.value;
    this.setState(stateInput);
  }

  handleEnterMessage(e) {
    e.key === 'Enter' && this.addMessage();
  }

  render() {
    return (
      <div className="messages row justify-content-between">
        <div className="col-sm-3 friendsCol">
          <div className="card friendsCard">
            <h2 className="card-header">Friends</h2>
            <br/>
            <div className="card-block friendsCardBlock"
                 onMouseOver={() => {document.body.style.overflow='hidden'}}
                 onMouseOut={() => {document.body.style.overflow='auto'}}>
              <MessageFriendList selectFriend={this.selectFriend.bind(this)}/>
            </div>
          </div>
        </div>
        <div className="col-sm-8 messagesCol">
          <div className="card messagesCard">
            <h2 className="card-header">Messages</h2>
            <br/>
            <div className="card-block messagesCardBlock">
              {
                typeof this.state.selectedFriend === 'object' &&
                  <div className="messageList"
                       id="messageList"
                       onMouseOver={() => {document.body.style.overflow='hidden'}}
                       onMouseOut={() => {document.body.style.overflow='auto'}}>
                    {this.state.messages.map((message, index) => (
                        <MessagesList key={index} message={message} />
                    ))}
                  </div>
              }
              <div className="row justify-content-center">
                <div className="col">
                  <div>
                    <MessageFriendSelected friend={this.state.selectedFriend} mutualFriends={this.state.mutualFriends} updateMatches={this.props.updateMatches} changeMessage={this.changeMessage.bind(this)} addMessage={this.addMessage.bind(this)} handleEnterMessage={this.handleEnterMessage.bind(this)} messageText={this.state.messageText}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Messages;
