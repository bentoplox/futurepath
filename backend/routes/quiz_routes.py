import json
from flask import Blueprint, request, jsonify
from services.supabase_service import supabase

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/api/quiz/vote', methods=['POST'])
def handle_quiz_vote():
    """
    Handles student upvotes/downvotes strictly enforcing 1-vote-per-student.
    Toggles off if clicked twice.
    """
    data = request.json
    user_id = data.get('user_id')
    quiz_id = data.get('quiz_id')
    vote_type = data.get('vote_type') # 'upvote' or 'downvote'

    if not all([user_id, quiz_id, vote_type]):
        return jsonify({"success": False, "error": "Missing parameters"}), 400

    try:
        # Check existing vote
        existing_res = supabase.table('student_quiz_votes').select('*').eq('user_id', user_id).eq('quiz_id', quiz_id).execute()
        existing_vote = existing_res.data[0] if existing_res.data else None

        # Fetch current counters
        quiz_res = supabase.table('quiz').select('upvotes, downvotes').eq('quiz_id', quiz_id).execute()
        if not quiz_res.data:
            return jsonify({"success": False, "error": "Quiz not found"}), 404
        
        current_upvotes = quiz_res.data[0].get('upvotes') or 0
        current_downvotes = quiz_res.data[0].get('downvotes') or 0

        new_upvotes = current_upvotes
        new_downvotes = current_downvotes

        if not existing_vote:
            # BRAND NEW VOTE
            supabase.table('student_quiz_votes').insert({
                "user_id": user_id, "quiz_id": quiz_id, "vote_type": vote_type
            }).execute()
            
            if vote_type == 'upvote': new_upvotes += 1
            elif vote_type == 'downvote': new_downvotes += 1
            
        else:
            old_vote = existing_vote['vote_type']
            if old_vote == vote_type:
                # TOGGLE OFF (Undo vote)
                supabase.table('student_quiz_votes').delete().eq('user_id', user_id).eq('quiz_id', quiz_id).execute()
                if old_vote == 'upvote': new_upvotes = max(0, new_upvotes - 1)
                elif old_vote == 'downvote': new_downvotes = max(0, new_downvotes - 1)
            else:
                # SWITCH VOTE (e.g., from up to down)
                supabase.table('student_quiz_votes').update({"vote_type": vote_type}).eq('user_id', user_id).eq('quiz_id', quiz_id).execute()
                
                if old_vote == 'upvote': new_upvotes = max(0, new_upvotes - 1)
                elif old_vote == 'downvote': new_downvotes = max(0, new_downvotes - 1)
                
                if vote_type == 'upvote': new_upvotes += 1
                elif vote_type == 'downvote': new_downvotes += 1

        # Save the new aggregated counts back to the quiz table
        supabase.table('quiz').update({
            "upvotes": new_upvotes,
            "downvotes": new_downvotes
        }).eq('quiz_id', quiz_id).execute()

        return jsonify({"success": True, "upvotes": new_upvotes, "downvotes": new_downvotes})

    except Exception as e:
        print(f"[ERROR] Quiz voting failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
