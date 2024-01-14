from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio

total_connect = 0
user_connecting = []

class ChatConsumers(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()    
        global total_connect
        self.username = None
        
        self.room_name = 'chat_common'
        await self.channel_layer.group_add(self.room_name, self.channel_name)
    
        total_connect+=1
        await self.send(text_data=json.dumps({
            'status':'connect success'
        }))
        #gửi số lượt connect
        await self.channel_layer.group_send(self.room_name, {
            'type':'sendToClient',
            'status':'total_connect',
            'total_connect':total_connect
        })
    async def disconnect(self, code):
        global total_connect, user_connecting
        
        if self.username:
            user_connecting.remove(self.username)
            total_connect -= 1
            await self.channel_layer.group_send(self.room_name, {
                'type': 'sendToClient',
                'status': 'user_disconnect_and_total_connect',
                'username_disconnect': self.username,
                'total_connect': total_connect,
                'list_user_connecting': user_connecting
            })

            print(f"Disconnecting user {self.username}")
            
        # Rest of the disconnect logic
        self.close()
        #gửi số lượt connect
        # await self.channel_layer.group_send(self.room_name, {
        #     'type':'sendToClient',
        #     'status':'total_connect',
        #     'total_connect':total_connect,
        #     'list_user_connecting':user_connecting
        # })
        asyncio.sleep(1)
        self.close()
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if text_data_json['status'] =='disconnect':
            print('disconnect from client') 
        if text_data_json['status'] == 'connect':
            self.username = text_data_json['username']
            user_connecting.append(self.username)
            await self.channel_layer.group_send(self.room_name, {
                'type':'sendToClient',
                'status':'connect',
                'username':self.username,
                'list_user_connecting':user_connecting
            })
        print(user_connecting)
        
   
        if text_data_json['status'] == 'send_message':
            message = text_data_json['message']
            self.username = text_data_json['username']

        
            await self.channel_layer.group_send(self.room_name,{
                'type':'sendToClient',
                'status':'chat_message',
                'message':message,
                'username':self.username
            })

    async def sendToClient(self, event):
        status = event['status']

        if status == 'connect':
            username = event['username']
            list_user_connecting = event['list_user_connecting']
            await self.send(text_data=json.dumps({
                'status':'user_connect',
                'username':username,
                'list_user_connecting':list_user_connecting
            }))
 
        elif status == 'chat_message':
            message = event['message']
            username = event['username']
            await self.send(text_data=json.dumps({
                'message': message,
                'username':username
            }))

        elif status == 'total_connect':

            total_connect = event['total_connect']

            await self.send(text_data = json.dumps({
                'total_connect':total_connect
            }))

        elif status == 'user_disconnect_and_total_connect':

            total_connect = event['total_connect']
            username_disconnect = event['username_disconnect']
            list_user_connecting = event['list_user_connecting']
            await self.send(text_data = json.dumps({
                'status':'user_disconnect_and_total_connect',
                'user_disconnect':username_disconnect,
                'total_connect' :total_connect,
                'list_user_connecting':list_user_connecting
            }))


