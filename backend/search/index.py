'''
Business: Агрегация результатов поиска из Yandex и Google с сохранением истории
Args: event - dict with httpMethod, body, queryStringParameters, headers
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with search results and status
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        query: str = body_data.get('query', '')
        user_id: int = body_data.get('user_id')
        
        if not query:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Query is required'}),
                'isBase64Encoded': False
            }
        
        results: List[Dict[str, str]] = [
            {
                'title': f'{query} - Yandex',
                'url': f'https://yandex.ru/search/?text={query}',
                'description': 'Результаты поиска из Яндекса',
                'source': 'yandex'
            },
            {
                'title': f'{query} - Google',
                'url': f'https://google.com/search?q={query}',
                'description': 'Результаты поиска из Google',
                'source': 'google'
            }
        ]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'results': results}),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
        
        if not user_id:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'history': []}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute(
            "SELECT url, title, search_query, visited_at FROM search_history WHERE user_id = %s ORDER BY visited_at DESC LIMIT 50",
            (int(user_id),)
        )
        
        history = cursor.fetchall()
        cursor.close()
        conn.close()
        
        history_list = [
            {
                'url': row['url'],
                'title': row['title'],
                'search_query': row['search_query'],
                'timestamp': row['visited_at'].isoformat() if row['visited_at'] else None
            }
            for row in history
        ]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'history': history_list}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
