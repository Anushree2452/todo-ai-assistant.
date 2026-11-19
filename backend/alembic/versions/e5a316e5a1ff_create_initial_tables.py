from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e5a316e5a1ff'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table('users',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('role', sa.Enum('User', 'Admin', name='userrole'), server_default='User', nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_index('idx_users_role', 'users', ['role'], unique=False)
    op.create_table('categories',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_categories_user', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'name', name='uq_user_category')
    )
    op.create_table('tasks',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=True),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('status', sa.Enum('Pending', 'InProgress', 'Completed', name='taskstatus'), server_default='Pending', nullable=False),
    sa.Column('priority', sa.Enum('low', 'medium', 'high', name='taskpriority'), server_default='medium', nullable=False),
    sa.Column('due_date', sa.Date(), nullable=True),
    sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['categories.id'], name='fk_tasks_category', ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_tasks_user', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_tasks_user_due_date', 'tasks', ['user_id', 'due_date'], unique=False)
    op.create_index('idx_tasks_user_status', 'tasks', ['user_id', 'status'], unique=False)
    op.create_index('idx_tasks_user_title', 'tasks', ['user_id', 'title'], unique=False)

def downgrade() -> None:
    op.drop_index('idx_tasks_user_title', table_name='tasks')
    op.drop_index('idx_tasks_user_status', table_name='tasks')
    op.drop_index('idx_tasks_user_due_date', table_name='tasks')
    op.drop_table('tasks')
    op.drop_table('categories')
    op.drop_index('idx_users_role', table_name='users')
    op.drop_table('users')
