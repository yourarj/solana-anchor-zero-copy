use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solana_anchor_zero_copy {
    use std::ops::Deref;

    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn set_data(ctx: Context<SetData>, string_to_set: String) -> Result<()> {
        ctx.accounts
            .data_holder
            .load_mut()?
            .greet_string
            .copy_from_slice(string_to_set.as_bytes());
        msg!("greet string set successfully");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, seeds = [b"data_holder_v0", author.key().as_ref()], bump, payer=author, space= 10 * 1024 as usize)]
    pub data_holder: AccountLoader<'info, DataHolder>,
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}
#[account(zero_copy)]
#[repr(packed)]
pub struct DataHolder {
    pub greet_string: [u8; 920],
}

#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub data_holder: AccountLoader<'info, DataHolder>,
    #[account(mut)]
    pub writer: Signer<'info>,
}
