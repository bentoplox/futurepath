from flask import Blueprint, request, jsonify
from services.supabase_service import supabase

discussion_bp = Blueprint('discussion', __name__)

# ==========================================
# 1. CREATE NEW POST (With Split Logic)
# ==========================================
@discussion_bp.route('/api/discussion/posts', methods=['POST'])
def create_post():
    data = request.json
    try:
        post_type = data.get('post_type')
        
        # ⚡ SPLIT LOGIC: Jobs & Internships go to Admin, everything else is instant
        if post_type in ['job', 'internship']:
            status = 'pending'
        else:
            status = 'approved'
            
        payload = {
            "author_id": data.get('author_id'),
            "title": data.get('title'),
            "content": data.get('content'),
            "post_type": post_type,
            "company_name": data.get('company_name', ''),
            "application_link": data.get('application_link', ''),
            "image_url": data.get('image_url'),
            "status": status
        }
        
        res = supabase.table('alumni_posts').insert(payload).execute()
        return jsonify({"success": True, "post": res.data[0]})
        
    except Exception as e:
        print("[DB ERROR] Failed to create post:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

# ==========================================
# 2. GET LIVE FEED (Resilient Join)
# ==========================================
@discussion_bp.route('/api/discussion/feed', methods=['GET'])
def get_discussion_feed():
    try:
        # ⚡ FIXED: Explicitly tell Supabase to join via the Author foreign key
        res = supabase.table('alumni_posts')\
            .select('*, users!fk_alumni_posts_author(name, current_role, show_workplace)')\
            .eq('status', 'approved')\
            .order('created_at', desc=True)\
            .execute()
            
        return jsonify({"success": True, "posts": res.data})
        
    except Exception as e:
        print("[DB ERROR] Failed to fetch feed:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

# ==========================================
# 3. TOGGLE FAVORITE
# ==========================================
@discussion_bp.route('/api/discussion/favorite', methods=['POST'])
def toggle_favorite():
    data = request.json
    user_id = data.get('user_id')
    post_id = data.get('post_id')
    
    if not user_id or not post_id:
        return jsonify({"success": False, "error": "Missing user_id or post_id"}), 400
    
    try:
        # Check if already favorited
        res = supabase.table('discussion_favorites').select('*').eq('user_id', user_id).eq('post_id', post_id).execute()
        
        if res.data and len(res.data) > 0:
            # Remove favorite
            supabase.table('discussion_favorites').delete().eq('user_id', user_id).eq('post_id', post_id).execute()
            return jsonify({"success": True, "favorited": False})
        else:
            # Add favorite
            supabase.table('discussion_favorites').insert({"user_id": user_id, "post_id": post_id}).execute()
            return jsonify({"success": True, "favorited": True})
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ==========================================
# 4. GET STUDENT FAVORITES
# ==========================================
@discussion_bp.route('/api/discussion/favorites/<uuid:user_id>', methods=['GET'])
def get_favorites(user_id):
    try:
        res = supabase.table('discussion_favorites').select('post_id').eq('user_id', user_id).execute()
        favorite_ids = [item['post_id'] for item in res.data]
        return jsonify({"success": True, "favorites": favorite_ids})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ==========================================
# 5. SECURE DELETE POST
# ==========================================
@discussion_bp.route('/api/discussion/delete/<uuid:post_id>', methods=['DELETE'])
def delete_post(post_id):
    user_id = request.args.get('user_id') # Verify sender authorization
    
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    try:
        # Check ownership
        post_res = supabase.table('alumni_posts').select('author_id').eq('id', post_id).execute()
        if not post_res.data:
            return jsonify({"success": False, "error": "Post not found"}), 404
            
        if post_res.data[0]['author_id'] != user_id:
            return jsonify({"success": False, "error": "Unauthorized delete attempt"}), 403
            
        # Delete target item row
        supabase.table('alumni_posts').delete().eq('id', post_id).execute()
        
        return jsonify({"success": True, "message": "Post deleted successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
# ==========================================
# 6. GET ALL POSTS (For Alumni Dashboard)
# ==========================================
@discussion_bp.route('/api/discussion/all', methods=['GET'])
def get_all_discussions():
    try:
        # ⚡ FIXED: Explicitly tell Supabase to join via the Author foreign key
        res = supabase.table('alumni_posts')\
            .select('*, users!fk_alumni_posts_author(name, current_role, show_workplace)')\
            .order('created_at', desc=True)\
            .execute()
            
        return jsonify({"success": True, "posts": res.data})
        
    except Exception as e:
        print("[DB ERROR] Failed to fetch all posts:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500
